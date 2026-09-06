package com.example.demo.service.ai;
import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Component;

import com.example.demo.model.JobDescription;


@Component
public class JobDescriptionCatalog {

    private static final List<JobDescription> JOBS = List.of(
            new JobDescription("architect", "建築師",
                    "負責集合住宅與商辦大樓的建築設計與工地監造，需具備中華民國建築師執照，"
                            + "5 年以上建築設計實務經驗，熟悉建築技術規則、綠建築標章（EEWH）申請流程，"
                            + "能操作 AutoCAD、Revit 等設計軟體，有都市更新或容積移轉整合經驗者佳。"),
            new JobDescription("structural-engineer", "結構技師",
                    "負責建築結構分析與結構設計圖說審查，需具備結構工程技師或土木工程技師執照，"
                            + "3 年以上 RC、鋼構結構設計經驗，熟悉耐震設計規範與 ETABS、midas 等結構分析軟體。"),
            new JobDescription("accountant", "會計師",
                    "負責公司帳務處理、財務報表編製、營業稅與營所稅申報，需具備會計相關科系學歷，"
                            + "3 年以上事務所或企業會計經驗，熟悉工程業會計與工程合約收入認列，"
                            + "持有記帳士或會計師證照者佳。"));

    public List<JobDescription> findAll() {
        return JOBS;
    }

    public JobDescription findById(String id) {
        return JOBS.stream()
                .filter(job -> job.id().equals(id))
                .findFirst()
                .orElseThrow(() -> new NoSuchElementException("找不到職缺：" + id));
    }
}
