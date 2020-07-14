# gulp-boilerplate

gulp を使った開発環境です

## Overview

gulp (PUG + sass) + webpack v4 (TypeScript)

- [**gulp**](https://github.com/gulpjs/gulp)
  - [PUG](https://github.com/pugjs/pug)
  - [Sass](https://sass-lang.com/)
  - [PostCSS](https://github.com/postcss)
- [**webpack**](https://github.com/webpack/webpack)
  - [TypeScript](https://github.com/babel/babel)

> js の処理は webpack で行い、それ以外は gulp を使って処理をしています。

## Install

yarn を使うので下記に従い yarn インストールしてください。

```bash
$ brew install yarn
```

## Build Setup

```bash
# 依存モジュールをインストール。
$ yarn install

# 開発開始
$ yarn start

# 本番環境生成
$ yarn build

# 本番環境デバック
$ yarn browser
```

開発をする際、`yarn start`をして頂き、[http://localhost:8080](http://localhost:8080) にブラウザにアクセスすればデバックできます。

`yarn build`で production フォルダ内に納品ファイルが生成されます。

## Structure

```sh
.
├── dist                # 静的ファイル書出先
├── icon                # アイコンフォントを生成するファイル
├── production          # 本番環境向けのファイル書出先
├── src                 # 実際に手を動かすファイル
└── system              # ビルド環境
```
