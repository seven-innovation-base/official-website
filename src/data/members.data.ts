/**
 * 基地成员信息列表
 * name: 昵称
 * avatar：头像链接，也可通过 "github:用户名" 使用 GitHub 头像
 * description：自我描述
 * githubUrl：GitHub 链接，可选
 * blogUrl：博客链接或其他媒体链接，可选
 */
const members: Member[] = [
  {
    name: 'Tanger',
    avatar: 'github:redhat123456',
    description: '题不可一日不刷',
    githubUrl: 'https://github.com/redhat123456',
    blogUrl: 'https://redhat123456.github.io/router_index/'
  },
  {
    name: '池溟昌胤',
    avatar: 'https://img1.baidu.com/it/u=4155685643,781819570&fm=253&fmt=auto&app=138&f=JPEG?w=509&h=500',
    description: '一个想学王安的縩鞲罢了',
    githubUrl: 'https://github.com/8cmcy8',
    blogUrl: 'https://8cmcy8.github.io/'
  },
  {
    name: 'yww',
    avatar: 'github:jaslli',
    description: '表面很菜，其实很强',
    githubUrl: 'https://github.com/jaslli',
    blogUrl: 'https://yww52.com/',
  },
  {
    name: 'yeshan333',
    avatar: 'github:yeshan333',
    description: '玄学爱好者&摸🐟大师，资深混子',
    githubUrl: 'https://github.com/yeshan333',
    blogUrl: 'https://shansan.top',
  },
  {
    name: 'Sustart',
    avatar: 'https://cdn.jsdelivr.net/gh/MrGo123/asset@2020-1-2-1.0/headPortrait/mybloghp.jpg',
    description: '赶紧学习',
    githubUrl: 'https://github.com/MrGo123',
    blogUrl: 'https://zy68.top/'
  },
  {
    name: 'Higgins',
    avatar: 'https://i.loli.net/2020/07/31/QLmPF47aCS8sYGf.jpg',
    description: '道生一，一生二',
    githubUrl: 'https://github.com/higgins995',
    blogUrl: 'https://higgins995.top/',
  },
  {
    name: 'lemon',
    avatar: 'https://lvshaomei.github.io/images/banner/labia.jpeg',
    description: 'The harder, the more fortunate',
    githubUrl: 'https://github.com/Lvshaomei',
    blogUrl: 'https://lvshaomei.github.io/',
  },
  {
    name: 'suze',
    avatar: 'https://avatars.githubusercontent.com/u/58203118?v=4',
    description: '今天也是努力写代码的一天呢',
    githubUrl: 'https://github.com/suze233',
    blogUrl: 'https://suze666.top'
  },
  {
    name: 'lei',
    avatar: 'github:Leishen-hub',
    description: '鱼',
    githubUrl: 'https://github.com/Leishen-hub',
    blogUrl: 'https://leishen-hub.github.io/',
  },
  {
    name: 'liang',
    avatar: 'github:010505',
    description: '从菜鸟到大神',
    githubUrl: 'https://github.com/010505',
    blogUrl: 'https://github.com/010505/official-website'
  },
    {
    name: 'norno',
    avatar: 'github:nornoya',
    description: '0v0',
    githubUrl: 'https://github.com/nornoya',
    blogUrl: 'https://nornoya.github.io/'
  },
    {
    name: 'ZXY39',
    avatar: 'github:zxy39',
    description: '愿存初心',
    githubUrl: 'https://github.com/ZXY39',
    blogUrl: 'https://zxy39.gitee.io/'
  },
  {
    name: 'WSX',
    avatar: 'github:SS-YSY',
    description: '努力努力再努力',
    githubUrl: 'https://github.com/SS-YSY',
    blogUrl: 'https://ss-ysy.github.io/'
  },
  {
    name: 'Axieyun',
    avatar: 'github:Axieyun',
    description: '生而为人，无惧挑战',
    githubUrl: 'https://github.com/Axieyun',
    blogUrl: 'http://blog.axieyun.top'
  },
  {
    name: 'lucky_dog',
    avatar: 'github:LuckyLXS',
    description: '你我终会在山巅相遇',
    githubUrl: 'https://github.com/LuckyLXS',
    blogUrl: 'https://LuckyLXS.github.io'
  },
  {
    name: 'Jellylorry',
    avatar: 'github:Jellylorry',
    description: '又菜又爱摸',
    githubUrl: 'https://github.com/Jellylorry',
    blogUrl: 'https://gitee.com/jellylorry'
  },
  {
    name: 'KIKO',
    avatar: 'github:2484895358',
    description: '每天多努力一点点',
    githubUrl: 'https://github.com/2484895358',
    blogUrl: ''
  },
  {
    name: 'jj123t',
    avatar: 'github:jj123t',
    description: 'Zzz',
    githubUrl: 'https://github.com/jj123t',
    blogUrl: 'https://jj123t.github.io'
  },
  {
    name: 'dong', 
    avatar: 'github:ZDHdong',
    description: '攀登高峰',
    githubUrl: 'https://github.com/ZDHdong',
    blogUrl: 'https://www.cnblogs.com/Z-dong/',
  },
  {
    name: '爱用酒精勾兑', 
    avatar: 'github:zqqqqqqj1110',
    description: '知行合一',
    githubUrl: 'https://github.com/zqqqqqqj1110',
    blogUrl: 'http://8.130.141.48/',
  },
  {
    name: '情用香烟麻醉', 
    avatar: 'github:DiDiiDiii',
    description: '低调~~~',
    githubUrl: 'https://github.com/DiDiiDiii',
    blogUrl: 'https://github.com/DiDiiDiii',
  },
    {
    name: 'xunyue', 
    avatar: 'github:dsylxt',
    description: '人海山川，不过尔尔',
    githubUrl: 'https://github.com/dsylxt/dsylxt.github.io',
    blogUrl: 'https://dsylxt.github.io/',
  },
  {
    name: '新手佳佳', 
    avatar: 'github:xinshoujiajia',
    description: '啥都不会，啥都想学',
    blogUrl: 'https://xinshoujiajia.github.io/',
  },
  {name: '昵称未知',
   avatar: 'github:unknown-v7',
   description: '机油哒',
   githubUrl: 'https://github.com/unknown-v7.github.io/',
   blogUrl: 'https://unknown-v7.io/',
  },  
  {
    name: 'lelouch', 
    avatar: 'github:lelouch',
    description: 'zero',
    blogUrl: 'https://lelouch04321.github.io/',
  },
  {
    name: '西东温',
    avatar: 'https://xidongwe.github.io/%E5%9B%BE%E7%89%87/07618237eb8bb8651fee9b3db77ce636492309796.jpg@1192w.jpg',
    description: '泥嚎人类',
    githubUrl: 'https://github.com/XiDongWe/XiDongWe.github.io',
    blogUrl: 'XiDongWe.github.io/',
  },
]
.map(it => ({
  ...it,
  avatar: handleAvatar(it.avatar)
}));

function handleAvatar(avatar: string) {
  var match = /^github\:(.+)$/.exec(avatar);
  if (match) return "https://avatars.githubusercontent.com/" + match[1] + "?s=256";
  return avatar;
}

export default members;
