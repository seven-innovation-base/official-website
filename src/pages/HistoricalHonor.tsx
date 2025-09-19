import React from 'react';
import Layout from '@theme/Layout';
import { Table, Tag } from 'antd';

import 'antd/dist/antd.css';
import { data } from '../data/historicalHonor.data';

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




function HistoricalHonor() {
  // 自动为数据添加递增的key
  const dataWithKey = data.map((item, index) => ({
    ...item,
    key: index // 直接使用数字类型的key
  }));

  return (
    <Layout title="Hello">
      <main>
        <div className="container">
          <div className="text--center margin-vert--lg">
            <h1>近年参赛获奖</h1>
            <p>很多，还在整理当中，下面展示是近年国家级、省部级获奖的一部分......</p>
          </div>
          <Table
            dataSource={dataWithKey} columns={columns} pagination={false}
          />
        </div>
      </main>
    </Layout>
  );
}

export default HistoricalHonor;
