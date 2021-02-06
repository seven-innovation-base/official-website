import React from 'react';
import Layout from '@theme/Layout';
import shuffle from 'shuffle-array';

import members from '../data/members.data';
import TeamMemberProfileCard from '../components/TeamMemberProfileCard';

function MemberList() {
  const members_shuffle = shuffle([...members]);
  return (
    <div className="row">
      {members_shuffle.map(member => (
        <TeamMemberProfileCard
          key={member.githubUrl}
          className={'col col--3 margin-bottom--md'}
          name={member.name}
          avatar={member.avatar}
          children={member.description}
          githubUrl={member.githubUrl}
          blogUrl={member.blogUrl}
          qrCode={member.qrCode}
        />
      ))}
    </div>
  );
}

function MembersWall() {
  return (
    <Layout title="团队成员">
      <main className="container margin-vert--lg">
        <div className="text--center margin-bottom--xs">
          <h1>团队成员</h1>
          <p>Members，以下卡片组使用
            <a href="https://leetcode-cn.com/problems/shuffle-an-array/solution/xi-pai-suan-fa-xiang-jie-by-jackwener/" target="_blank">
            洗牌算法
            </a>随机排列
          </p>
        </div>
      </main>
      <MemberList />
      <div className="text--center margin-bottom--xs">
        <p>
          <a
            className={'button button--lg button--primary'}
            href={"https://github.com/seven-innovation-base/official-website/edit/main/src/data/members.data.js"}
            target={'_blank'}>
            送我上墙
            </a>
        </p>
      </div>
    </Layout>
  );
}

export default MembersWall;

