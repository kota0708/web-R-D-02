import * as THREE from 'Three';
import Stats from 'stats.js';
import gsap from 'gsap';

import { checkOddNumber } from '../../shared/scripts/_checkoddNumber';
import { sleep } from '../../shared/scripts/_sleep';

import { TImages } from './type/_data';
import { images } from './constants/_data';

// 画像の横幅
const imageWidth = 500;

// 画像の縦の間隔
const intervalHeight = 80;

// 画像の横の間隔
const intervalWidth = 160;

class Index {
  private width: number;
  private height: number;
  private el: HTMLCanvasElement;

  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private light: THREE.DirectionalLight;
  private data: TImages[][][];
  private stats: Stats;

  private count: number;

  private promises: Promise<unknown>[];

  constructor() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.el = document.getElementById('app-01') as HTMLCanvasElement;

    this.data = images;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.el
    });

    this.scene = new THREE.Scene();

    this.promises = [];

    this.camera = new THREE.PerspectiveCamera(
      60,
      this.width / this.height,
      1,
      10000
    );

    this.count = 0;

    this.light = new THREE.DirectionalLight(0xffffff);

    this.stats = new Stats();
    this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(this.stats.dom);

    this.onResize = this.onResize.bind(this);
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

    // 少し時間を開ける。
    await sleep(100);

    // テクスチャーを描画させる
    this.setTexture();

    this.onListener();

    // リクエストアニメーションフレームを回す。

    gsap.ticker.add(() => this.tick());
    gsap.ticker.fps(60);
  }

  private onListener(): void {
    window.addEventListener('resize', this.onResize);
  }

  // リサイズイベント
  private onResize(): void {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.renderer.setSize(this.width, this.height);

    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
  }

  // 描画するデータをまとめる。
  private setData(): void {
    this.data.forEach((r: TImages[][]) => {
      // 横列分
      r.forEach((rr: TImages[], i: number) => {
        // 縦列分
        rr.forEach((c: TImages) => {
          // 画像の読み込みをするのでPromiseを返すようにする。
          const result = new Promise((resolve: (value?: unknown) => void) => {
            // 画像の読み込み
            new THREE.TextureLoader().load(
              `image/${c.image}.jpg`,
              (texture: THREE.Texture) => {
                const material = new THREE.MeshBasicMaterial({ map: texture });

                this.camera.position.set(0, 0, 6000);

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

                // 描画するpolygonを取得
                const polygon = new THREE.Mesh(geometry, material);

                // データセット
                c.height = height;
                c.polygon = polygon;
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

          this.promises[i] = result;
        });
      });
    });
  }

  // テクスチャーを描画
  private setTexture() {
    console.log(this.data);

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
          const { polygon, height } = c;

          // 一番最初のデータの処理
          if (ii === 0) {
            // 画像の半径 + 間隔
            const rate = height / 2 + intervalHeight;

            // 奇数は整数、偶数はマイナスにする。
            const num = checkOddNumber(iii + 1) ? rate : -rate;

            // 画像の縦列と横列を配置する
            polygon.position.set(
              0 + (imageWidth + intervalWidth) * index,
              num,
              0
            );
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
            polygon.position.set(
              0 + (imageWidth + intervalWidth) * index,
              num,
              0
            );
          }

          this.scene.add(polygon);
        });
      });
    });
  }

  private tick(): void {
    // requestAnimationFrame(() => this.tick());

    this.stats.begin();
    this.renderer.clear();

    this.renderer.render(this.scene, this.camera);
    this.stats.end();
  }
}

const index = new Index();
index.init();
