import { Comment, List, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import './index.css';
import axios from 'axios';
import moment from 'moment';
import { CommentAPI } from '../../api';

function parseContent(content) {
  const lines = content.split('\n');
  const replyLines = [];
  const mainLines = [];
  lines.forEach(line => {
    if (line.trim().startsWith('>')) {
      replyLines.push(line.replace(/^>\s?/, ''));
    } else {
      mainLines.push(line);
    }
  });
  return {
    replyContent: replyLines.join('\n'),
    mainContent: mainLines.join('\n'),
  };
}

export default function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(CommentAPI.GithubIssueUrl).then(res => {
      const rawData = res.data.map(item => {
        const { replyContent, mainContent } = parseContent(item.body);
        return {
          key: item.id,
          author: item.user.login,
          avatar: item.user.avatar_url,
          mainContent,
          replyContent,
          datetime: moment(item.created_at).format('YYYY-MM-DD HH:mm:ss'),
        };
      });

      // 以主评论内容为key建立映射，方便查找
      const mainContentMap = new Map();
      rawData.forEach(item => {
        // 只有没有回复内容的才算主评论
        if (!item.replyContent) {
          mainContentMap.set(item.mainContent.trim(), {
            ...item,
            replies: [],
          });
        }
      });

      // 遍历所有带回复的评论，把它们挂载到对应的主评论上
      rawData.forEach(item => {
        if (item.replyContent) {
          const repliedMainContent = item.replyContent.trim();
          // 找到对应的主评论
          if (mainContentMap.has(repliedMainContent)) {
            mainContentMap.get(repliedMainContent).replies.push({
              key: item.key,
              author: item.author,
              avatar: item.avatar,
              replyContent: item.mainContent, // 这里是回复的主体内容
              datetime: item.datetime,
            });
          } else {
            // 没找到对应主评论时，可以当作单独的主评论处理
            if (!mainContentMap.has(item.mainContent.trim())) {
              mainContentMap.set(item.mainContent.trim(), {
                ...item,
                replies: [],
              });
            }
          }
        }
      });

      setData(Array.from(mainContentMap.values()));
      setLoading(false);
    });
  }, []);

  return (
  <div className="comment-container">
    <Spin spinning={loading}>
      <List
        dataSource={data}
        itemLayout="horizontal"
        pagination={{ pageSize: 5, showSizeChanger: false }}
        renderItem={item => (
          <li key={item.key} className="comment-item">
            <Comment
              author={item.author}
              avatar={item.avatar}
              content={<p className="comment-list-p">{item.mainContent}</p>}
              datetime={item.datetime}
            />
            {item.replies.map(reply => (
              <div key={reply.key} className="comment-reply-wrapper">
                <Comment
                  author={reply.author}
                  avatar={reply.avatar}
                  content={<pre className="comment-reply">{reply.replyContent}</pre>}
                  datetime={reply.datetime}
                />
              </div>
            ))}
          </li>
        )}
      />
    </Spin>
    <div className="Comment-setion2">
      <div className="buttons">
        <Link
          className="button button--outline button--secondary button--lg"
          to="https://github.com/seven-innovation-base/official-website/issues/86"
        >
          我也来说几句
        </Link>
      </div>
    </div>
  </div>
);
}
