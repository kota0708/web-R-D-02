import * as THREE from 'Three';
import Stats from 'three/examples/jsm/libs/stats.module';

import { checkOddNumber } from '../../shared/scripts/_checkoddNumber';

import { TImages } from './type/_data';
import { images } from './constants/_data';

const interval = 80;

class Index {
  private width: number;
  private height: number;
  private el: HTMLCanvasElement;

  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private light: THREE.DirectionalLight;
  private data: TImages[][][];

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

    this.light = new THREE.DirectionalLight(0xffffff);
  }

  private sleep(num: number): Promise<unknown> {
    return new Promise((resolve: (value?: unknown) => void) => {
      setTimeout(() => resolve(), num);
    });
  }

  public async init(): Promise<void> {
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0x000000, 1);
    this.renderer.autoClear = false;

    // 画像の読み込みのデータを取得
    this.setData();

    // 画像を読み込み
    await Promise.all(this.promises);

    // 少し時間を開ける。
    await this.sleep(100);

    // テクスチャーを描画させる
    this.setTexture();

    // リクエストアニメーションフレームを回す。
    this.tick();
  }

  // 描画するデータをまとめる。
  private setData(): void {
    this.data.forEach((r: TImages[][]) => {
      // 横列分
      return r.forEach((rr: TImages[], i: number) => {
        // 縦列分
        return rr.forEach((c: TImages) => {
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
                const height = 500 * rate;

                // イタポリ
                const geometry = new THREE.PlaneGeometry(500, height, 1, 1);

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
    this.data.forEach((r: TImages[][], iii: number) => {
      // 横列分回す。
      r.forEach((rr: TImages[], i: number) => {
        // 縦列分回す。
        rr.forEach((c: TImages, ii: number) => {
          const { polygon, height } = c;

          // 一番最初のデータの処理
          // 横列
          if (i === 0) {
            // 画像の半径 + 間隔
            const rate = height / 2 + interval;

            // 奇数は整数、偶数はマイナスにする。
            // 縦列
            const num = checkOddNumber(ii + 1) ? rate : -rate;

            // 画像の縦列と横列を配置する
            // 最高
            polygon.position.set(0 + (500 + interval) * iii, num, 0);
          } else {
            // 前に置いてある画像の高さの総合 + 間隔
            let h = 0;

            // 過去の画像の高さを足す。
            // 横列
            for (let t = 0; t < i; t++) {
              // 縦列
              h = h + r[t][ii].height + interval * 2;
            }

            // 画像の高さを一旦フラットにする。
            let rate = height / 2 + interval;

            // 前にある画像の高さ分を足す。
            rate = rate + h;

            // 画像の縦列を配置
            // 縦列
            const num = checkOddNumber(ii + 1) ? rate : -rate;

            // 画像の縦列と横列を配置する
            // 最高
            polygon.position.set(0 + (500 + interval) * iii, num, 0);
          }

          this.scene.add(polygon);
        });
      });
    });
  }

  private tick(): void {
    // this.stats.begin();
    requestAnimationFrame(() => this.tick());
    this.renderer.clear();

    this.renderer.render(this.scene, this.camera);
    // this.renderer.render(this.scene3D, this.camera3D);
    // this.stats.end();
  }
}

const index = new Index();
index.init();
