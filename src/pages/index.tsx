import React from 'react';
import classnames from 'classnames';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';


const features = [
  {
    title: <>算法部</>,
    imageUrl: 'img/algorithms.png',
    description: (
      <>
        本部门以培养优秀的算法工程师为目标。夯实算法基础和领会并能灵活运用编程思想。
        提升算法优化能力、逻辑思维能力和抽象建模能力，为今后的参与算法比赛和就业做
        准备。
      </>
    ),
  },
  {
    title: <>大数据技术与分析部</>,
    imageUrl: 'img/bigdata.png',
    description: (
      <>
        本部门以培养优秀的数据研发工程师为目标。打好扎实的数理统计
        基础，掌握数据挖掘的基础理论、核心算法、关键技术及软件系统，
        熟悉海量复杂数据的组织、处理、分析、挖掘和可视化等问题。
      </>
    ),
  },
  {
    title: <>信息安全部</>,
    imageUrl: 'img/security.png',
    description: (
      <>
        本部门研究范围较广，主要涉及木马编程、网络渗透、逆向工程、代码审计、
        密码学及社会工程学等方向。部门不同方向的成员可以通过相互组队，参加各大
        CTF夺旗赛及信息安全比赛。
      </>
    ),
  },
  {
    title: <>应用软件研发部</>,
    imageUrl: 'img/software.png',
    description: (
      <>
        本部门以培养计算机技术领域优秀的工程师为目标，学习方向广泛。
        主要有：Web 开发、移动端开发（Android、iOS、Hybrid）、泛
        客户端开发、DevOps、云计算&云原生等等。
      </>
    ),
  },
];

function Feature({imageUrl, title, description}) {
  const imgUrl = useBaseUrl(imageUrl);
  return (
    <div className={classnames('col col--6', styles.feature)}>
      {imgUrl && (
        <div className="text--center">
          <img className={styles.featureImage} src={imgUrl} alt={title} />
        </div>
      )}
      {/* <h3>{title}</h3> */}
      <p>{description}</p>
    </div>
  );
}

function Home() {
  const context = useDocusaurusContext();
  const {siteConfig = {}} = context;
  return (
    <Layout
      title={`欢迎来到 ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />">
      <header className={classnames('hero', styles.heroBanner)}>
        <div className="container">
          <img
            className={classnames(styles.featureImage, 'margin-vert--md')}
            src={useBaseUrl('img/logo.png')}
          />
          <h1 className="hero__title">{siteConfig.title}</h1>
          <p className="hero__subtitle">{siteConfig.tagline}</p>
          <div className={styles.buttons}>
            <Link
              className={classnames(
                'button button--outline button--secondary button--lg',
                styles.getStarted,
              )}
              to={useBaseUrl('docs/')}>
              Get Started
            </Link>
          </div>
        </div>
      </header>
      <main>
        <div
          className={classnames(styles.announcement, styles.announcementDark)}>
          <div className={styles.announcementInner}>
            了解更多，敬请关注{' '}
            <Link to={useBaseUrl('/docs')}>
              🔗
            </Link>
            .
          </div>
        </div>
        {features && features.length > 0 && (
          <section className={styles.features}>
            <div className="container">
              <div className="row">
                {features.map((props, idx) => (
                  <Feature key={idx} {...props} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </Layout>

  );
}

export default Home;


