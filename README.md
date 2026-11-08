# AEE 女装选款

公开商品展示页：31 款服装、5 个分类、83 张图片，支持搜索、价格排序、图集和复制询款。商品信息按原二维码中的 AEE 页面整理，实际价格和库存需向商家确认。

这是部署源文件，不代表网页已经上线。`dist/` 是静态网站目录，不需要数据库或服务器端程序，也没有顾客登录或支付功能。

## 发布到 Render

[打开 Render 部署设置](https://render.com/deploy?repo=https%3A%2F%2Fgithub.com%2FA-Jhu1%2Faee-wardrobe-catalog)

通过 Render Blueprint 选择本仓库，确认服务类型是 Static Site，发布目录为 `dist`。仓库根目录的 `render.yaml` 已提供对应配置。也可以新建 Static Site，选择本仓库，Build Command 填 `echo "Static catalog ready"`，Publish Directory 填 `dist`。

部署完成后使用平台返回的实际 HTTPS 地址，先验证匿名访问和商品图片，再生成指向该地址的二维码。需要在实际手机的微信中测试；电脑端测试不能替代手机网络测试。

## 更新

商品数据：`dist/catalog.json`。图片：`dist/assets/real/`。更新并重新部署同一个服务即可保留原网址和二维码。
