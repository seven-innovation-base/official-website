import React from 'react';
import Layout from '@theme/Layout';
import { Table, Tag } from 'antd';

import 'antd/dist/antd.css';

const columns = [
  {
    title: '名字',
    dataIndex: 'names',
    key: 'names',
    render: names => (
      <>
        {names.map(tag => {
          return (
            <Tag color={'blue'} key={tag}>
              {tag.toUpperCase()}
            </Tag>
          );
        })}
      </>
    ),
  },
  {
    title: '比赛',
    dataIndex: 'contest',
    key: 'contest',
  },
  {
    title: '奖项级别',
    key: 'tags',
    dataIndex: 'tags',
    render: tags  => (
      <>
          {tags.map(tag => {
              let color = "geekblue";
              switch (tag.substr(tag.length - 2, 2)) {
                  case "国一":
                      color = "purple"
                      break;
                  case "国二":
                      color = "magenta"
                      break;
                  case "国三":
                      color = "cyan"
                      break;
                  case "省一":
                      color = "volcano"
                      break;
                  case "省二":
                      color = "orange"
                      break;
                  case "省三":
                      color = "blue"
                      break;
              }
              return (
                  <Tag color={color} key={tag}>
                      {tag.toUpperCase()}
                  </Tag>
              );
          })}
      </>
  ),
  },
];

const data = [
  {
    key: '1',
    names: ['谭前程','梁樱兰','梁坤','吴思萱','李春明','梁美华'],
    contest: '2021年高教社杯全国大学生数学建模竞赛',
    tags: ['[1人] · 国一', '[1人] · 国二','[2人] · 省一','[1人] · 省二','[3人] · 省三'],
  },
  {
    key: '2',
    names: ['习宇兴','何壮艺','杨再骥','梁坤','李春明','谭前程'],
    contest: '第十二届蓝桥杯全国软件和信息技术专业人才大赛',
    tags: ['[1人] · 国二', '[2人] · 国优','[4人] · 省一','[2人] · 省二','[1人] · 省三'],
  },
  {
    key: '3',
    names: ['吕少梅','梁樱兰','谭前程'],
    contest: '第八届全国金融与证券投资模拟实训大赛',
    tags: ['[2人] · 国二', '[1人] · 国三'],
  },
  {
    key: '4',
    names: ['韦宇敬','梁坤','谭前程'],
    contest: '第七届中国国际“互联网+”大学生创新创业大赛“数广集团杯”',
    tags: ['[3人] · 省三'],
  },
  {
    key: '5',
    names: ['梁樱兰'],
    contest: '第十届正太杯市场调查分析大赛',
    tags: [ '[1人] · 国三'],
  },
  {
    key: '6',
    names: ['贺亚琳','陶晓莹','梁智清'],
    contest: '第十一届正太杯市场调查分析大赛',
    tags: [ '[3人] · 国三'],
  },
  {
    key: '7',
    names: ['梁樱兰','梁坤','贺亚琳','陶晓莹','梁智清'],
    contest: '第九届泰迪杯',
    tags: [ '[5人] · 国三'],
  },
  {
    key: '8',
    names: ['习宇兴','陶晓莹'],
    contest: '第十七届“挑战杯”全国大学生课外学术科技作品',
    tags: [ '[1人] · 国二'],
  },
  {
    key: '9',
    names: ['谭前程'],
    contest: '第十一届MathorCup数学建模大赛',
    tags: [ '[1人] · 国三'],
  },
  {
    key: '10',
    names: ['梁樱兰'],
    contest: '第四届中青杯全国大学生数学建模',
    tags: [ '[1人] · 国二'],
  },

];


function HistoricalHonor() {
  return (
    <Layout title="Hello">
      <main>
        <div className="container">
          <div className="text--center margin-vert--lg">
            <h1>近年参赛获奖</h1>
            <p>很多，还在整理当中，下面展示是近年国家级、省部级获奖的一部分......</p>
          </div>
          <Table
            dataSource={data} columns={columns} pagination={false}
          />
        </div>
      </main>
    </Layout>
  );
}

export default HistoricalHonor;
