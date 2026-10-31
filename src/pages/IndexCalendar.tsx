import React from "react";
import Section from "../components/Section";
import  Calendar  from "../components/Calendar";

function IndexCalendar() {
    return (
        <Section
            title="基地日历📅"
            description="这个日历记录了基地的一些时间安排（参考）"
            bannerStyle={{ width: "80%" }}>
            <Calendar></Calendar>
        </Section>
        
    );
}

export default IndexCalendar;
