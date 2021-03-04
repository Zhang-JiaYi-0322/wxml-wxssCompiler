# **YOU SHOULD NEVER USE THIS REPOSITORY**

## 如何使用

```bash
npm install @microsoft/rush -g
rush update
rush build
cd example/workspace
npm run start
```

## wxml 编译器
### 测试用例

```bash
cd ./compiler
npm run test:generator2
```

### 实时编译ts文件
```bash
cd ./compiler
npm run watch
```

### 编译单个文件
```bash
cd ./compiler/test/single
node index.js
```
输入文件为 ```simple.wxml```
输出文件为 ```output.wxml.js```


