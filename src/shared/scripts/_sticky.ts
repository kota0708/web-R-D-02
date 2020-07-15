type TScroll = {
  top: number;
  bottom: number;
  el: HTMLElement;
  child: HTMLElement;
};

type TOpt = {
  parent: string;
  child: string;
  interval?: number;
};

class Sticky {
  private $$sections: Array<HTMLElement>;
  private sectionsOpt: Array<TScroll>;
  private child: string;
  private scrollTop: number;
  private while: number;
  private time: number;

  constructor(opt: TOpt) {
    const { parent, child, interval }: TOpt = opt;

    this.$$sections = this.makeArray(document.querySelectorAll(parent));

    this.child = child;
    this.sectionsOpt = [];
    this.scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    this.onScroll = this.onScroll.bind(this);
    this.onResize = this.onResize.bind(this);

    this.while = interval || 0;
    this.time = Date.now();
  }

  public init(): void {
    this.$$sections.forEach((r: HTMLElement, i: number) => {
      const result: TScroll = {
        top: this.offsetTop(r),
        bottom: this.offsetTop(r) + r.clientHeight,
        el: r,
        child: r.querySelector(this.child)
      };

      this.sectionsOpt[i] = result;
    });
    this.onListener();
  }

  private onListener(): void {
    window.addEventListener('resize', this.onResize);
    window.addEventListener('scroll', this.onScroll);
  }

  // スクロールイベント
  private onScroll(): void {
    this.scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    this.onSicky();
  }

  // 追従の処理
  private onSicky(): void {
    this.sectionsOpt.forEach((r: TScroll) => {
      const $$parent: HTMLElement = r.el;
      const $$child: HTMLElement = r.child;

      const isStart: boolean = $$parent.classList.contains('start');
      const isEnd: boolean = $$parent.classList.contains('end');

      if (r.top <= this.scrollTop + this.while && r.bottom >= this.scrollTop) {
        if (isStart) {
          $$parent.classList.remove('start');
        } else if (isEnd) {
          $$parent.classList.remove('end');
        }

        $$child.style.width = `${$$parent.clientWidth}px`;

        const bottom: number = $$parent.clientHeight - $$child.clientHeight;
        const scrollBottom: number = this.scrollTop + $$child.clientHeight;

        if (r.bottom - this.while <= scrollBottom) {
          // 要素が親の高さを超えた場合
          $$child.style.position = 'absolute';
          $$child.style.top = `${bottom}px`;
        } else {
          $$child.style.position = 'fixed';
          $$child.style.top = `${this.while}px`;
        }
      } else if (r.top > this.scrollTop) {
        if (!isStart) {
          $$parent.classList.add('start');
          $$child.style.position = 'absolute';
          $$child.style.width = '100%';
          $$child.style.top = '0px';
        }
      } else if (r.bottom < this.scrollTop) {
        if (!isEnd) {
          const bottom: number = $$parent.clientHeight - $$child.clientHeight;

          $$parent.classList.add('end');
          $$child.style.position = 'absolute';
          $$child.style.width = '100%';
          $$child.style.top = `${bottom}px`;
        }
      }
    });
  }

  // リサイズの処理
  private onResize(): void {
    const onProcess: () => void = () => {
      this.resetVal();
      this.onSicky();
    };

    this.throttle(onProcess, 1000);
  }

  // 要素の値をリセット
  private resetVal(): void {
    this.$$sections.forEach((r: HTMLElement, i: number) => {
      this.sectionsOpt[i].top = this.offsetTop(r);
      this.sectionsOpt[i].bottom = this.offsetTop(r) + r.clientHeight;
    });
  }

  /**
   * domの高さを取得
   * @param {HTMLElement} el dom
   * @returns {number} 高さの値
   */
  private offsetTop: (el: HTMLElement) => number = (el: HTMLElement) => {
    const rect: DOMRect = el.getBoundingClientRect() as DOMRect;
    const scrollTop: number =
      window.pageYOffset || document.documentElement.scrollTop;
    const myTop: number = rect.top + scrollTop;

    return myTop;
  };

  /**
   * 間引き
   * @param {Function} func 間引きしたい処理
   * @param {number} duration 間引きの間隔
   */
  private throttle: (func: () => void, duration: number) => void = (
    func: () => void,
    duration = 1000
  ) => {
    duration = duration / 60;

    const onResult: () => void = () => {
      if (this.time + duration - Date.now() < 0) {
        this.time = new Date().getTime();
        func();
      }
    };

    return onResult();
  };

  /**
   * @param {NodeListOf<HTMLElement>} obj NodeListの配列
   * @returns {Array<HTMLElement>} domが入った配列
   */
  private makeArray: (obj: NodeListOf<HTMLElement>) => Array<HTMLElement> = (
    obj: NodeListOf<HTMLElement>
  ) => {
    const array: Array<HTMLElement> = [];
    for (let i = 0, num = obj.length; i < num; i++) {
      array[i] = obj[i];
    }
    return array;
  };
}

export default Sticky;
