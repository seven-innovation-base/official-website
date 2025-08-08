import React from 'react';
import Layout from '@theme/Layout';
import members from '../data/members.data';
import TeamMemberProfileCard from '../components/TeamMemberProfileCard';

// 洗牌算法：Fisher-Yates Shuffle
function shuffleArray<T>(array: T[]): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

function MemberList() {
  const shuffledMembers = shuffleArray(members);

  return (
    <div className="row">
      {shuffledMembers.map((member) => (
        <TeamMemberProfileCard
          key={member.githubUrl + member.name}
          className={'col col--3 margin-bottom--md'}
          name={member.name}
          avatar={member.avatar}
          children={member.description}
          githubUrl={member.githubUrl}
          blogUrl={member.blogUrl}
        />
      ))}
    </div>
  );
}

function MembersWall() {
  return (
    <Layout title="团队成员">
      <main>
        <div className="text--center margin-vert--lg">
          <h1>团队成员</h1>
          <p>Members</p>
        </div>
        <div className="container">
          <MemberList />
        </div>
        <div className="text--center margin-vert--lg">
          <p>
            <a
              className="button button--lg button--primary"
              href="https://github.com/seven-innovation-base/official-website/edit/main/src/data/members.data.ts"
              target="_blank"
            >
              送我上墙
            </a>
          </p>
        </div>
      </main>
    </Layout>
  );
}

export default MembersWall;
