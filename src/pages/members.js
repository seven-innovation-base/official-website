import React from 'react';
import Layout from '@theme/Layout';

import members from '../data/members.data';
import TeamMemberProfileCard from '../components/TeamMemberProfileCard';

function MemberList() {
  return (
    <div className="row">
      {members.map(member => (
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
          <p>Members</p>
        </div>
      </main>
      <MemberList />
      <div className="text--center margin-bottom--xs">
        <p>
          <a
            className={'button button--lg button--primary'}
            href={"https://github.com/seven-innovation-base/official-website/edit/main/src/data/members.js"}
            target={'_blank'}>
            送我上墙
            </a>
        </p>
      </div>
    </Layout>
  );
}

export default MembersWall;

