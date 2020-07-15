import * as THREE from 'Three';
import Stats from 'three/examples/jsm/libs/stats.module';

import { checkOddNumber } from '../../shared/scripts/_checkoddNumber';

type TImages = {
  image: number;
  height: number;
  index?: number;
  polygon: THREE.Mesh | null;
};

const images: TImages[][] = [
  [
    {
      image: 0,
      height: 0,
      polygon: null
    },
    {
      image: 1,
      height: 0,
      polygon: null
    }
  ],
  [
    {
      image: 2,
      height: 0,
      polygon: null
    },
    {
      image: 3,
      height: 0,
      polygon: null
    }
  ]
];

class Index {
  private width: number;
  private height: number;
  private el: HTMLCanvasElement;

  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private light: THREE.DirectionalLight;
  private data: TImages[][];

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

    this.setData();

    await Promise.all(this.promises);

    await this.sleep(100);

    console.log(this.data);

    this.setTexture();

    this.tick();
  }

  // 描画するデータをまとめる。
  private setData(): void {
    this.data.forEach((r: TImages[], i: number) => {
      return r.forEach((c: TImages) => {
        const result = new Promise((resolve: (value?: unknown) => void) => {
          new THREE.TextureLoader().load(
            `image/${c.image}.jpg`,
            (texture: THREE.Texture) => {
              const material = new THREE.MeshBasicMaterial({ map: texture });

              this.camera.position.set(0, 0, 1000);

              // 画像の比率を取得
              const rate = texture.image.height / texture.image.width;

              // 画像の高さを取得
              const height = 500 * rate;

              // イタポリ
              const geometry = new THREE.PlaneGeometry(500, height, 1, 1);

              // 描画するpolygonを取得
              const polygon = new THREE.Mesh(geometry, material);

              // polygon.position.set(0, 0, 0);

              // this.scene.add(polygon);

              c.height = height;
              c.polygon = polygon;
              c.index = i;

              resolve();
            }
          );
        });

        this.promises[i] = result;
      });
    });
  }

  private setTexture() {
    this.data.forEach((r: TImages[], i: number) => {
      r.forEach((c: TImages, ii: number) => {
        const { polygon } = c;

        polygon.position.set(0, 0, 0);

        this.scene.add(polygon);
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
