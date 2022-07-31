import React from "react";
import Section from "../components/Section";
import  Video  from "../components/Video";

function PromotionalVideo() {
    return (
        <Section
            title="宣传视频"
            description="可以稍微期待一下呢........"
            bannerStyle={{ width: "80%" }}>
            <Video></Video>
        </Section>
    );
}

export default PromotionalVideo;
