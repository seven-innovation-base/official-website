import { Comment, List, Spin } from 'antd';
import React from 'react';
import { useState , useEffect } from 'react';
import  './index.css'
import axios from 'axios';
import moment from 'moment';
import { CommentAPI } from '../../api';
import Link from '@docusaurus/Link';

export default function App() {
  const [data, setData] = useState([])
  const [loading , setloading] = useState(false)
  useEffect(() => {
    axios.get(CommentAPI.GithubIssueUrl)
      .then((res) => {
        const data1 = new Array();
        for (var i = 0; i < res.data.length; i++) {
          var comment = {
            author: res.data[i].user.login,
            avatar: res.data[i].user.avatar_url,
            content: res.data[i].body,
            datetime: moment(res.data[i].created_at).format('YYYY-MM-DD HH:mm:ss') as unknown as string
          }
          data1.push(comment)
        }
        setData(data1)
        const loading1 = true;
        setloading(loading1)
      })
  }, []);

  
  return (
    <div className='comment'>
      { <div>
      {loading ? <List
      className="comment-list"
      header={`${data.length} 条评论`}
      itemLayout="horizontal"
      dataSource={data}
      renderItem={item => (
        <li>
          <Comment
            author={<div className='comment-list-name'>{item.author}</div>}
            avatar={item.avatar}
            content={<b><p className="comment-list-p">{item.content}</p></b>}
            datetime={<span className='comment-list-name'>{item.datetime}</span>}
          />
        </li>
      )}
      /> : <Spin tip="Loading..." size="large">
    </Spin>} 
    </div> }
    
      <div className="Comment-setion2">
      <div className="buttons">
            <Link
              className={
                'button button--outline button--secondary button--lg'}
              to={"https://github.com/seven-innovation-base/official-website/issues/86"}>
              我也来说几句
            </Link>
        </div>
        </div>
      </div>
  );
};
