import * as THREE from 'Three';
import Stats from 'stats.js';
import gsap from 'gsap';
import Hammer from 'hammerjs';
import Tweakpane from 'tweakpane';

import vertexShader from './gl/vertexShader.vert';
import fragmentShader from './gl/fragmentShader.frag';

import { checkOddNumber } from '../../shared/scripts/_checkoddNumber';
import { getDevice } from '../../shared/scripts/_ua';

import { TImages } from './type/_data';
import { images } from './constants/_data';

// 画像の横幅
const imageWidth = 500;

// 画像の縦の間隔
const intervalHeight = 40;

// 画像の横の間隔
const intervalWidth = 80;

type TMeshData = {
  mesh: THREE.Mesh;
  value: number;
  isAniamtion: boolean;
  width: number;
  height: number;
  opacity: number;
  positions: THREE.Vector3;
};

class Index {
  private width: number;
  private height: number;
  private el: HTMLElement;
  private toggle: HTMLElement;
  private stats: Stats;
  private count: number;
  private isCheck: boolean;
  private promises: Promise<unknown>[];

  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private light: THREE.DirectionalLight;
  private data: TImages[][][];
  private mouse: THREE.Vector2;
  private mouseData: THREE.Vector2;
  private move: THREE.Vector2;
  private click: THREE.Vector2;
  private raycasterMouse: THREE.Raycaster;
  private raycasterClick: THREE.Raycaster;
  private meshs: TMeshData[];
  private hammer: HammerManager;
  private isPan: boolean;
  private panTimer: number;
  private ua: string;
  private scale: number;
  private dist: number;

  constructor() {
    // ウインドウサイズを格納
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    // element
    this.el = document.getElementById('app'); // canvas
    this.toggle = document.getElementById('js-toggle'); // closeボタン

    this.data = images; // テクスチャーのデータ
    this.isCheck = false; // 画像がクリックされているか確認
    this.ua = getDevice(); // ユーザーエージェントを取得

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.el as HTMLCanvasElement
    });

    this.scene = new THREE.Scene();

    this.promises = []; // 画像の読み込みのPromise

    // カメラの距離をwindowの縦幅に合わせる処理
    const fov = 60;
    const fovRad = (fov / 2) * (Math.PI / 180); // 視野角をラジアンに変換
    this.dist = this.height / 2 / Math.tan(fovRad); // ウィンドウぴったりのカメラ距離

    this.camera = new THREE.PerspectiveCamera(
      60,
      this.width / this.height,
      1,
      this.dist * 2
    );

    // hammer
    this.hammer = new Hammer(this.el);
    this.hammer.get('pan').set({ enable: true });
    this.hammer.get('pinch').set({ enable: true });
    this.isPan = false;
    this.panTimer = -1;

    // 拡大率
    this.scale = 0;

    // テクスチャーを中央にするために使うカウント
    this.count = 0;

    // メッシュを入れる箱
    this.meshs = [];

    this.light = new THREE.DirectionalLight(0xffffff);
    this.mouse = new THREE.Vector2();
    this.move = new THREE.Vector2();
    this.mouseData = new THREE.Vector2();
    this.click = new THREE.Vector2();
    this.raycasterMouse = new THREE.Raycaster();
    this.raycasterClick = new THREE.Raycaster();

    // stats
    this.stats = new Stats();
    this.stats.showPanel(0);
    document.body.appendChild(this.stats.dom);

    this.onResize = this.onResize.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onClickRemove = this.onClickRemove.bind(this);
  }

  public async init(): Promise<void> {
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0xffffff, 1);
    this.renderer.autoClear = false;

    // 画像の読み込みのデータを取得
    this.setData();

    // 画像を読み込み
    await Promise.all(this.promises);

    // テクスチャーを描画させる
    this.setTexture();

    setTimeout(() => {
      this.onListener();
    }, 2500);

    // リクエストアニメーションフレームを回す。

    gsap.ticker.add(() => this.tick());
    gsap.ticker.fps(60);
  }

  private onListener(): void {
    window.addEventListener('resize', this.onResize);
    this.el.addEventListener('mousemove', this.onMouseMove);
    this.el.addEventListener('click', this.onClick);
    this.toggle.addEventListener('click', this.onClickRemove);
    this.hammer.on('pinch', (e: any) => this.onPinch(e));
    this.hammer.on('pan', (e: HammerInput) => this.onPan(e));
  }

  /**
   * 画像表示を元に戻す処理
   */
  private onClickRemove(): void {
    if (!this.isCheck) {
      return;
    }

    this.meshs.forEach((r: any) => {
      const { isAniamtion, mesh, positions } = r;

      if (isAniamtion) {
        gsap.to(mesh.position, {
          x: positions.x,
          y: positions.y,
          z: 0,
          ease: 'expo.out'
        });

        gsap.to(r, {
          scaleX: 1,
          scaleY: 1,
          ease: 'sine.out',
          onUpdate: () => {
            mesh.scale.set(r.scaleX, r.scaleY, 1);
          }
        });

        r.isAniamtion = false;
      } else {
        gsap.to(r, {
          opacity: 1,
          duration: 0.5,
          ease: 'sine.out',
          onUpdate: () => {
            mesh.material.uniforms.uOpacity.value = r.opacity;
          }
        });
      }
    });

    this.toggle.classList.remove('display');

    this.isCheck = false;
  }

  /**
   * Panの処理
   * @param e hammerの返り血
   */
  private onPan(e: HammerInput): void {
    if (this.isCheck) {
      return;
    }

    if (!this.isPan) {
      this.isPan = true;
      this.mouseData.x = this.camera.position.x;
      this.mouseData.y = this.camera.position.y;

      this.el.classList.add('grabbing');
    }

    gsap.to(this.move, {
      x: this.mouseData.x - e.deltaX * 2,
      y: this.mouseData.y + e.deltaY * 2,
      duration: 1,
      ease: 'power4.out'
    });

    window.clearTimeout(this.panTimer);

    this.panTimer = window.setTimeout(() => {
      this.isPan = false;
      this.el.classList.remove('grabbing');
    }, 200);
  }

  /**
   * ピンチの処理
   * @param e hammerの返り血
   */
  private onPinch(e: any): void {
    if (this.isPan && this.isCheck) {
      return;
    }

    this.scale += e.additionalEvent === 'pinchin' ? e.scale * -20 : e.scale * 5;
  }

  /**
   * クリックイベント
   */
  private onClick(event: any): void {
    if (this.isCheck || this.isPan) {
      return;
    }

    const element = event.currentTarget;

    // canvas要素上のXY座標
    const x = event.clientX - element.offsetLeft;
    const y = event.clientY - element.offsetTop;
    // canvas要素の幅・高さ
    const w = element.offsetWidth;
    const h = element.offsetHeight;

    // -1〜+1の範囲で現在のマウス座標を登録する
    this.click.x = (x / w) * 2 - 1;
    this.click.y = -(y / h) * 2 + 1;

    this.raycasterClick.setFromCamera(this.click, this.camera);
    const intersects = this.raycasterClick.intersectObjects(
      this.scene.children
    );

    this.meshs.forEach((r: any) => {
      const { mesh, width, height } = r;

      if (intersects.length > 0 && mesh === intersects[0].object) {
        // meshの位置をカメラの中心の位置にする
        gsap.to(mesh.position, {
          x: this.camera.position.x,
          y: this.camera.position.y,
          z: 1,
          duration: 0.6,
          delay: 0.2
        });

        // 横、縦を図る。
        const isWidth = !!(width > height);

        // ウインドウサイズ分をサイズを大きくする
        gsap.to(r, {
          scaleX: isWidth
            ? window.innerWidth / width
            : window.innerHeight / height,
          scaleY: isWidth
            ? window.innerWidth / width
            : window.innerHeight / height,
          duration: 0.6,
          delay: 0.1,
          onUpdate: () => {
            mesh.scale.set(r.scaleX, r.scaleY, 1);
          }
        });

        console.log(r);

        // アニメーションしているmesh
        r.isAniamtion = true;
      } else if (intersects.length > 0 && mesh) {
        // 選んだ以外のメッシュを消す
        gsap.to(r, {
          opacity: 0,
          duration: 0.5,
          ease: 'sine.out',
          onUpdate: () => {
            mesh.material.uniforms.uOpacity.value = r.opacity;
          }
        });
      }
    });

    // ちゃんとmeshをクリックしたか確認
    if (intersects.length > 0) {
      this.toggle.classList.add('display');

      this.isCheck = true;
    }
  }

  // マウスイベント
  onMouseMove(event: any) {
    if (this.isPan) {
      return;
    }

    const element = event.currentTarget;

    // canvas要素上のXY座標
    const x = event.clientX - element.offsetLeft;
    const y = event.clientY - element.offsetTop;

    this.mouseData.x = event.clientX - element.offsetLeft;
    this.mouseData.y = event.clientY - element.offsetTop;

    // canvas要素の幅・高さ
    const w = element.offsetWidth;
    const h = element.offsetHeight;

    // -1〜+1の範囲で現在のマウス座標を登録する
    this.mouse.x = (x / w) * 2 - 1;
    this.mouse.y = -(y / h) * 2 + 1;
  }

  // リサイズイベント
  private onResize(): void {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    const fov = 60;
    const fovRad = (fov / 2) * (Math.PI / 180); // 視野角をラジアンに変換
    this.dist = this.height / 2 / Math.tan(fovRad); // ウィンドウぴったりのカメラ距離

    this.renderer.setSize(this.width, this.height);

    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
  }

  // 描画するデータをまとめる。
  private setData(): void {
    this.data.forEach((r: TImages[][]) => {
      // 横列分
      r.forEach((rr: TImages[]) => {
        // 縦列分
        rr.forEach((c: TImages) => {
          // 画像の読み込みをするのでPromiseを返すようにする。
          const result = new Promise((resolve: (value?: unknown) => void) => {
            // 画像の読み込み
            new THREE.TextureLoader().load(
              `image/${c.image}.jpg`,
              (texture: THREE.Texture) => {
                // const material = new THREE.MeshBasicMaterial({ map: texture });

                const material = new THREE.ShaderMaterial({
                  uniforms: {
                    uTexture: { value: texture },
                    uTrans: { value: 1 },
                    uOpacity: { value: 0 },
                    uResolution: {
                      value: new THREE.Vector2(
                        texture.image.width,
                        texture.image.height
                      )
                    },
                    uImageResolution: {
                      value: new THREE.Vector2(
                        texture.image.width,
                        texture.image.height
                      )
                    }
                  },
                  vertexShader,
                  fragmentShader,
                  transparent: true
                });

                this.camera.position.set(0, 0, this.dist);

                this.camera.lookAt(new THREE.Vector3(0, 0, 0));

                // 画像の比率を取得
                const rate = texture.image.height / texture.image.width;

                // 画像の高さを取得
                const height = imageWidth * rate;

                // イタポリ
                const geometry = new THREE.PlaneGeometry(
                  imageWidth,
                  height,
                  1,
                  1
                );

                // 描画するmeshを取得
                const mesh = new THREE.Mesh(geometry, material);

                // データセット
                c.height = height;
                c.mesh = mesh;
                c.index = c.image;

                // 終了を返す
                resolve();

                // 非同期デバック
                // setTimeout(() => {
                //   console.log('ssss');

                //   resolve();
                // }, Math.random() * 10000);
              }
            );
          });

          this.promises.push(result);
        });
      });
    });
  }

  // テクスチャーを描画
  private setTexture() {
    this.data.forEach((r: TImages[][], i: number) => {
      console.log(`${i} ${this.count}`);

      // 中央を起点にするためのindex値
      const index = checkOddNumber(i) ? i - this.count : (i - this.count) * -1;

      // 計算するためのカウントアップ
      if (!checkOddNumber(i) && i !== 0) {
        this.count++;
      }

      // 横列分回す。
      r.forEach((rr: TImages[], ii: number) => {
        // 縦列分回す。
        rr.forEach((c: TImages, iii: number) => {
          const { mesh, height } = c;

          // 一番最初のデータの処理
          if (ii === 0) {
            // 画像の半径 + 間隔
            const rate = height / 2 + intervalHeight;

            // 奇数は整数、偶数はマイナスにする。
            const num = checkOddNumber(iii + 1) ? rate : -rate;

            // 画像の縦列と横列を配置する
            mesh.position.set(0 + (imageWidth + intervalWidth) * index, num, 0);
          } else {
            // 前に置いてある画像の高さの総合 + 間隔
            let h = 0;

            // 前の画像の高さを足す。
            for (let t = 0; t < ii; t++) {
              h = h + r[t][iii].height + intervalHeight * 2;
            }

            // 画像の高さを一旦フラットにする。
            let rate = height / 2 + intervalHeight;

            // 前にある画像の高さ分を足す。
            rate = rate + h;

            // 画像の縦列を配置
            const num = checkOddNumber(iii + 1) ? rate : -rate;

            // 画像の縦列と横列を配置する
            mesh.position.set(0 + (imageWidth + intervalWidth) * index, num, 0);
          }

          // メッシュデータ
          this.meshs.push({
            mesh,
            isAniamtion: false,
            value: 1,
            width: imageWidth,
            height,
            positions: new THREE.Vector3(
              mesh.position.x,
              mesh.position.y,
              mesh.position.z
            ),
            opacity: 1
          });

          // 初期時のscaleのアニメーション

          const anim = {
            opacity: 0,
            scale: 0.6
          };

          mesh.scale.set(0, 0, 0);

          gsap.to(anim, {
            scale: 1,
            opacity: 1,
            duration: 3,
            ease: 'power3.inOut',
            onUpdate: () => {
              const m = mesh.material as any;

              m.uniforms.uOpacity.value = anim.opacity;
              mesh.scale.set(anim.scale, anim.scale, anim.scale);
            }
          });

          this.scene.add(mesh);
        });
      });
    });
  }

  private tick(): void {
    this.stats.begin();
    this.raycasterMouse.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycasterMouse.intersectObjects(
      this.scene.children
    );

    // hoverの処理
    this.meshs.forEach((r: any) => {
      const { mesh, isAniamtion } = r;

      if (
        intersects.length > 0 &&
        mesh === intersects[0].object &&
        !isAniamtion &&
        !this.isPan &&
        this.ua !== 'sp' &&
        this.ua !== 'tab'
      ) {
        gsap.to(r, {
          value: 0.8,
          duration: 1.2,
          ease: 'expo.out'
        });

        mesh.material.uniforms.uTrans.value = r.value;
      } else {
        gsap.to(r, {
          value: 1,
          duration: 1.2,
          ease: 'expo.out'
        });

        mesh.material.uniforms.uTrans.value = r.value;
      }
    });

    // カーソルの処理
    if (intersects.length > 0 && !this.isCheck) {
      this.el.classList.add('pointer');
    } else {
      this.el.classList.remove('pointer');
    }

    this.renderer.clear();

    if (!this.isCheck) {
      this.camera.position.set(this.move.x, this.move.y, this.dist); // カメラ
      this.el.classList.remove('normal'); // カーソルを通常のを外す
    } else {
      this.el.classList.add('normal'); // カーソルを通常のに戻す
    }

    this.renderer.render(this.scene, this.camera);
    this.stats.end();
  }
}

const index = new Index();
index.init();

const pane = new Tweakpane({
  title: 'scale'
});

pane.addInput(index, 'scale', {
  label: 'scale',
  step: 0.1,
  min: 1,
  max: 2000
});
