import React from "react";
import Layout from "@theme/Layout";
import { PageMetadata } from "@docusaurus/theme-common";

import MembersTimeline from "@site/src/components/Members/MembersTimeline";
import Section from "@site/src/components/Section";  // 假设路径是这样

import styles from "./styles.module.css";


import members from '../data/members.data';

export default function Members(): JSX.Element {
  return (
    <Layout>
      <PageMetadata
        title="Our Members"
        description="The members directory of the team"
      />
      <main>
        <div style={{ marginTop: '-100px' }} >
          <Section
            title="七院创新基地 · 团队成员"
            description="这里是我们团队的详细成员介绍"
            bannerStyle={{  }}
          >
            <div className={styles.content}>
              <MembersTimeline members={members} />
            </div>
          </Section>
        </div>
      </main>
    </Layout>
  );
}
