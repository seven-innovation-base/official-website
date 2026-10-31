import React from "react";
import Section from "../components/Section";
import  Comment  from "../components/Comment";

function IndexComment() {
    return (
        <Section
            title="一些关于基地的评价🥰"
            description="这个页面是对基地的一些评价，欢迎发言😎"
            bannerStyle={{ width: "80%" }}>
            <Comment></Comment>
        </Section>
        
    );
}

export default IndexComment;