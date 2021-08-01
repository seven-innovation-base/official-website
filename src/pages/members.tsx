import React from 'react';
import Layout from '@theme/Layout';


import members from '../data/members.data';
import TeamMemberProfileCard from '../components/TeamMemberProfileCard';

function MemberList() {

  const Newmerber = sort(members);
  return (
    <div className="row">
      {Newmerber.map(member => {

        return (
        <TeamMemberProfileCard
          key={member.githubUrl+member.name}
          className={'col col--3 margin-bottom--md'}
          name={member.name}
          avatar={member.avatar}
          children={member.description}
          githubUrl={member.githubUrl}
          blogUrl={member.blogUrl}
        />);
      })}
    </div>
  );
}


function sort(arr) {
  var length = arr.length,
  temp,
  random;
while(0 != length){
  random = Math.floor(Math.random() * length)
  length--;
  temp = arr[length];
  arr[length] = arr[random];
  arr[random] = temp;
}
return arr;
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

