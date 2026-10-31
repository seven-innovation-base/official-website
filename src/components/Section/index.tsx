import React, { CSSProperties } from 'react';
import { Typography } from 'antd';
import './index.css';
const { Title } = Typography;

export interface IProps {
    title: string;
    description?: string;
    children: JSX.Element | string;
    bannerStyle?: CSSProperties;
}

function Section({ title, description, children, bannerStyle }: IProps) {
    return (
        <section className="Section-container">
            <div className="Section-blank" />
            <Title level={1} className="Section-title">{title}</Title>
            <p className="Section-description">{description}</p>
            <div className="Section-banner" style={bannerStyle}>
                {children}
            </div>
        </section>
    );
}

export default Section;