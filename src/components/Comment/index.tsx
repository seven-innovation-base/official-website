import { Comment, List, Tooltip } from 'antd';
import React from 'react';
import { useState , useEffect } from 'react';
import  './index.css'
import axios from 'axios';
import { CommentAPI } from '../../api';

export default function App() {
  const [data, setData] = useState([])

  useEffect(() => {
    axios.get(CommentAPI.GithubIssueUrl)
      .then((res) => {
        const data1 = new Array();
        for (var i = 0; i < res.data.length; i++) {
          var comment = {
            author: res.data[i].user.login,
            avatar: res.data[i].user.avatar_url,
            content: res.data[i].body,
            datetime: res.data[i].created_at.slice(0, 10) + " " + String(Number(res.data[i].created_at.slice(11, 12)) + 8) + res.data[i].created_at.slice(13, 19)
          }
          data1.push(comment)
        }
        setData(data1)
      })
  }, []);

  
    return (
    <List
      className="comment-list"
      header={`${data.length} 条评论`}
      itemLayout="horizontal"
      dataSource={data}
      renderItem={item => (
        <li>
          <Comment
            author={item.author}
            avatar={item.avatar}
            content={<p className="comment-list-p">{item.content}</p>}
            datetime={<Tooltip title={item.datetime}><span>{item.datetime}</span></Tooltip>}
          />
        </li>
      )}
    />
  );
};




