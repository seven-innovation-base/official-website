import React from "react";
import styles from "./MembersTimeline.module.css";

export type Member = {
  name: string;
  role: string;
  description?: string;
  avatar?: string;
  github?: string;
  blog?: string;
  email?: string;
};

export type ClassGroup = {
  classOf: number | string;
  memberList: Member[];
};

export type Props = {
  members: ClassGroup[];
};

function IconLink({
  href,
  label,
  children,
}: {
  href?: string;
  label: string;
  children: React.ReactNode;
}) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={label}
      className={styles.iconLink}
    >
      {children}
    </a>
  );
}

function MemberCard({ member }: { member: Member }) {
  const { name, role, description, avatar, github, blog, email } = member;

  const mailto = email ? `mailto:${email}` : undefined;

  return (
    <div className={styles.memberCard}>
      <img
        className={styles.avatar}
        src={avatar || "https://via.placeholder.com/80?text=?"}
        alt={name}
        loading="lazy"
      />
      <div className={styles.info}>
        <strong className={styles.name}>{name}</strong>
        <span className={styles.role}>{role}</span>
        {description && <p className={styles.description}>{description}</p>}

        <div className={styles.icons}>
          <IconLink href={github} label="GitHub">
            <svg
              role="img"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              className={styles.icon}
            >
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.11.82-.26.82-.577v-2.234c-3.338.726-4.033-1.415-4.033-1.415-.546-1.387-1.333-1.757-1.333-1.757-1.09-.745.084-.729.084-.729 1.204.084 1.838 1.236 1.838 1.236 1.07 1.835 2.807 1.305 3.492.997.108-.776.418-1.305.76-1.605-2.665-.3-5.466-1.334-5.466-5.93 0-1.31.47-2.38 1.236-3.22-.124-.303-.536-1.523.116-3.176 0 0 1.007-.322 3.3 1.23a11.52 11.52 0 013-.404c1.02.005 2.045.138 3 .404 2.29-1.552 3.295-1.23 3.295-1.23.655 1.653.244 2.873.12 3.176.77.84 1.234 1.91 1.234 3.22 0 4.61-2.804 5.625-5.475 5.92.43.372.823 1.1.823 2.222v3.293c0 .32.217.694.825.576C20.565 21.796 24 17.295 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </IconLink>

          <IconLink href={blog} label="博客">
            <svg
              role="img"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              className={styles.icon}
            >
              {/* 链接图标 */}
              <path d="M17.657 6.343a6 6 0 010 8.485l-1.414 1.414a1 1 0 01-1.414-1.414l1.414-1.414a4 4 0 10-5.657-5.657l-3.536 3.535a4 4 0 005.657 5.657 1 1 0 011.414 1.414 6 6 0 01-8.485-8.485l3.535-3.535a6 6 0 018.485 0zm-7.071 7.071a1 1 0 010-1.414l5.657-5.657a1 1 0 111.414 1.414l-5.657 5.657a1 1 0 01-1.414-1.414z"/>
            </svg>
          </IconLink>

          <IconLink href={mailto} label="邮件">
            <svg
              role="img"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              className={styles.icon}
            >
              <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 2l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z" />
            </svg>
          </IconLink>
        </div>
      </div>
    </div>
  );
}

export default function MembersTimeline({ members }: Props) {
  return (
    <div className={styles.timelineContainer}>
  {members.map(({ classOf, memberList }, idx) => (
    <div key={classOf} className={styles.timelineItem}>
      {/* 左侧时间轴标记 */}
      <div className={styles.timelineMarker}>
        <span className={styles.timelineDot}></span>
        <div className={styles.classLabel}>{classOf} 级</div>
      </div>

      {/* 右侧成员卡片列表 */}
      <div className={styles.membersList}>
        {memberList.map((m) => (
          <MemberCard key={m.name} member={m} />
        ))}
      </div>
    </div>
  ))}
</div>


  );
}
