import React from 'react';
import Layout from '@theme/Layout';

// import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './style.css';

function Hello() {
  return (
    <Layout title="Hello">

      <div id="wrap">
        <div id="head">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>

      <p style={{
        fontSize: '20px',
        textAlign: 'justify',
        marginLeft: '20px',
        marginRight: '20px'
      }}>
        &ensp;&ensp;&ensp;&ensp;数学与计算科学学院创新实践基地自2007年成立以来,基地成员开拓创新,积极进取,在全国大学生数学建模竞赛、全国大学生数学竞赛、美赛、蓝桥杯大赛等各类大大小小的赛事中都取得了优异的成绩。在2020,蓝桥杯有两名同学取得国赛二等奖的优异成绩。并且创新基地成员获得省赛以上奖励的同学占全院报名人数的46%以上，占基地报名人数的57%以上，可以说本次蓝桥杯取得了相当不错的成绩。在全国大学生数学建模竞赛中，创新基地成员表现突出，相比去年，获奖比例和获奖等级都有明显的提高。从参加的比赛项目来看，今年创新基地的同学都在不同大大小小的比赛中取得了优异的成绩。在这个过程中他们锻炼了自己的能力，无论获奖与否，在实践中都会获得成长。以战代学，从实践中获得得绝对比“纸”上多。
	    </p>

    </Layout>
  );
}

export default Hello;