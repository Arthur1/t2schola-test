# t2schola-test

nodejs version 14.13.1

※ v12系だと動作しない

## init

```
$ git clone git@github.com:Arthur1/t2schola-test.git
$ cd t2schola-test
$ yarn install
$ cp .env.sample .env
$ cp matrix-code.json.sample matrix-code.json
```

### matrix-code.json

TitechAppからエクスポートした形式。A1,A2,A3,...,J7の順。サンプルファイル参照。

初回起動時に学籍番号、パスワード、マトリクスコードのJSONファイル名を聞かれる。

実行後、認証情報は暗号化して保存されるので、マトリクスコードのJSONファイルは削除してかまわない。

### .env

SALTには、`crypto.randomBytes(16).toString('base64')` で生成した文字列を入れる。

## exec

```
$ yarn main
```

## 認証情報をリセットしたいとき

```
$ yarn remove
```
