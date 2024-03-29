# 令和4年度 民間ユースケース開発　UC22-003「容積率可視化シミュレータ」の成果物（Volume Shape Generator）
![スクリーンショット 2023-04-04 125502](https://user-images.githubusercontent.com/79615787/229683349-960ed493-cf15-4bd1-8429-da2bceab29c5.png)


## 1. 概要
開発した容積率可視化シミュレータにおける以下のボリューム生成処理を行うアプリケーションです。
* 建築物情報をJSON形式で受け取り、建築可能な建物の最大ボリュームと既存建築物の差分を3Dモデルを生成します。
* 建築物の3Dモデルデータの生成や、隣地斜線制限などの条件に従いモデルの加工を行う必要があるため、ブラウザ上で動くリアルタイム3DエンジンのBabylon.jsを使用しています。
* 生成した3Dモデルから、容積値の算出とGLB形式の書き出しを行います。
* 本アプリケーションでは機能確認用のサンプルを用意しています。SampleのJSON情報から3Dモデルを生成し、容積の数値表示とGLBファイルのダウンロードをテストできます。

## 2．「容積率可視化シミュレータ」について
近年、マンションの老朽化の急増が問題視される中、維持管理の適正化とともに、建替えの円滑化によるマンション再生の重要性が高まっています。
また、マンション建替円滑化法の施行により老朽化したマンションの建替えルールが整備されているものの、マンション所有者同士の合意形成及び建替えまでの実行プロセスの難易度がハードルとして存在しています。

今回の実証実験ではマンション所有者及び民間事業者による開発余地の把握を可能とし建替え・有効活用等の活性化への寄与することを目指し、3D 都市モデルの建築物モデル及び道路モデルを活用して、都市計画及び建築基準法に基づく指定容積率によって建築可能な建物の最大ボリューム（以下、容積ボリューム）と既存建築物の差分（余剰容積）を三次元的に分析して可視化するシステムを開発しました。

## 3．利用手順

* 詳しい利用方法については、こちらの[マニュアル](https://project-plateau.github.io/Volume-Shape-Generator/index.html)をご覧ください。

## ライセンス <!-- 定型文のため変更しない -->
* ソースコードおよび関連ドキュメントの著作権は国土交通省に帰属します。
* 本ドキュメントは[Project PLATEAUのサイトポリシー](https://www.mlit.go.jp/plateau/site-policy/)（CCBY4.0および政府標準利用規約2.0）に従い提供されています。

## 注意事項 <!-- 定型文のため変更しない -->

* 本レポジトリは参考資料として提供しているものです。動作保証は行っておりません。
* 予告なく変更・削除する可能性があります。
* 本レポジトリの利用により生じた損失及び損害等について、国土交通省はいかなる責任も負わないものとします。

## 参考資料　 <!-- 各リンクは納品時に更新 -->
* 容積率可視化シミュレータ技術検証レポート: https://www.mlit.go.jp/plateau/file/libraries/doc/plateau_tech_doc_0041_ver01.pdf
*  PLATEAU Webサイト Use caseページ「容積率可視化シミュレータ」: https://www.mlit.go.jp/plateau/use-case/uc22-003/
* Babylon.js Webサイト：https://www.babylonjs.com/

