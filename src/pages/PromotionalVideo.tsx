import React from "react";
import Section from "../components/Section";
import  Video  from "../components/Video";

function PromotionalVideo() {
    return (
        <Section
            title="宣传&介绍  视频"
            description="可以通过该视频来了解我们基地，希望能帮助到您了解我们基地😋"
            bannerStyle={{ width: "80%" }}>
            <Video></Video>
        </Section>
    );
}

export default PromotionalVideo;
