import React from 'react';
import Layout from '@theme/Layout';
import _ from 'lodash'

import members from '../data/members.data';
import TeamMemberProfileCard from '../components/TeamMemberProfileCard';

function MemberList() {
  var members1 = new Array()
  members1 = _.shuffle(members)
  return (
    <div className="row">
      {members1.map(member1 => {
        return (
        <TeamMemberProfileCard
          key={member1.githubUrl+member1.name}
          className={'col col--3 margin-bottom--md'}
          name={member1.name}
          avatar={member1.avatar}
          children={member1.description}
          githubUrl={member1.githubUrl}
          blogUrl={member1.blogUrl}
        />);
      })}
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
              className={'button button--lg button--primary'}
              href={"https://github.com/seven-innovation-base/official-website/edit/main/src/data/members.data.ts"}
              target={'_blank'}>
              送我上墙
              </a>
          </p>
        </div>
      </main>
    </Layout>
  );
}

export default MembersWall;

