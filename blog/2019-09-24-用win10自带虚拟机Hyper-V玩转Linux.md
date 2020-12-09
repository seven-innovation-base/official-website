---
slug: win10-hyper-v
title: 用win10自带虚拟机Hyper-V玩转Linux
author: upsilverfox
author_title: 七院学子
author_url: https://github.com/upsilverfox
author_image_url: https://avatars1.githubusercontent.com/u/54873798?s=460&v=4
tags: [Linux, 虚拟机]
---

## 教你如何使用win10自带虚拟机Hyper-V

1.  按win+pause break快速打开控制面板的系统和安全中的系统，点击控制面板

![](https://cdn.jsdelivr.net/gh/upsilverfox/turoot/pic20190923171407.png)

<!-- truncate -->

2.  在控制面版中，打开程序组件，选择程序与功能。点击启动或关闭windows功能。

![](https://cdn.jsdelivr.net/gh/upsilverfox/turoot/pic20190923171626.png)

3.  找到Hyper-V，打勾（注意win10家庭版时没有Hyper-V）

![](https://cdn.jsdelivr.net/gh/upsilverfox/turoot/pic20190923171703.png)

4.  勾选后，点击立即重启

![](https://cdn.jsdelivr.net/gh/upsilverfox/turoot/pic20190923172021.png)

5.  开机后找到Hyper-V，打开程序

![](https://cdn.jsdelivr.net/gh/upsilverfox/turoot/pic20190923172501.png)

## 虚拟机网络配置

1.  打开Hyper-V，在右侧操作列表中点击“虚拟交换机管理”，打开虚拟交换机管理器

![](https://cdn.jsdelivr.net/gh/upsilverfox/turoot/pic20190924164944.png)

2.  选择“新建虚拟网络交换机”，在虚拟交换机类型列表中选择“外部”，点击“创建虚拟交换机”，创建一个虚拟交换机，输入虚拟交换机的名称和说明，为虚拟交换机选择一个网络适配器（即物理网卡），点击“确定”。

![](https://cdn.jsdelivr.net/gh/upsilverfox/turoot/pic20190924165115.png)

3.  等待应用更改
    ![image0](https://cdn.jsdelivr.net/gh/upsilverfox/turoot/pic20190924165221.png)
4.  在Hyper-V管理器中，选择虚拟机，点击右侧操作列表中的“设置”，修改虚拟机配置。
    ![image1](https://cdn.jsdelivr.net/gh/upsilverfox/turoot/pic20190924172354.png)
5.  在虚拟机设置界面，点击“网络适配器”，选择虚拟交换机，点击确定，这样就配置好了虚拟机的网络连接。
    ![image2](https://cdn.jsdelivr.net/gh/upsilverfox/turoot/pic20190924165322.png)
    这样就完成里虚拟机的网络配置了；

## 开始创建虚拟机了

1.  下载虚拟机需要的镜像

推荐win10镜像链接：https://msdn.itellyou.cn/

推荐Linux链接：https://ubuntu.com/download/desktop/thank-you?country=CN\&version=18.04.3\&architecture=amd64\#download

将下载成功的镜像放在电脑上的一个文件夹中以备后用。

2.  开始创建 1）点击新建虚拟机
    ![image3](https://cdn.jsdelivr.net/gh/upsilverfox/turoot/pic20190923180139.png)

2）设置你的虚拟机的名称
![image4](https://cdn.jsdelivr.net/gh/upsilverfox/turoot/pic20190923180432.png)

3）指定代数，我选择的是第一代，继续选择下一步

4）网络配置，选择我们刚刚设置的网络名称

5）从我们的文件夹中选择镜像
![image5](https://cdn.jsdelivr.net/gh/upsilverfox/turoot/pic20190923181050.png)

6）后续就是下一步，完成。 示意图：
![image6](https://cdn.jsdelivr.net/gh/upsilverfox/turoot/pic20190923181246.png)

7）这里显示已经创建好了，然后右键选择启动该虚拟机(有点小慢)。启动之后右键选择连接开始自动安装系统，注意选择语言，否则安装之后是英文，如果对英文有点感冒的话，这里就修改下，要不然安装好之后有需要在设置里修改。
![image7](https://cdn.jsdelivr.net/gh/upsilverfox/turoot/pic20190924155802.png)

## 安排：

选择语言点击install ubuntu，之后就是下一步、下一步。
![image8](https://cdn.jsdelivr.net/gh/upsilverfox/turoot/pic20190924160051.png)

说明：1.因为是虚拟机所以可以清空虚拟U盘里的东西，这样对你现有的电脑文件没有影响的 2. 如果重启的时候出现错误记得关闭虚拟机，然后在开启。

## 参考：

1.  <https://baijiahao.baidu.com/s?id=1607835632188281786&wfr=spider&for=pc>
2.  <https://jingyan.baidu.com/article/a681b0de6109253b18434635.html>
3.  <https://jingyan.baidu.com/article/e9fb46e129349d7520f76648.html>