# HOW

## 如何将泛型和无需泛型的一起结合

```ts
/**
 * 一份问卷 ——> 一道问题
 */
export type SurveyQuestion/* <T extends SurveyQuestionType = unknown, C extends SurveyQuestionContent = unknown> */ = {
    id: string
    isRequired: boolean
    order: number
    questionType: SurveyQuestionType_Text
    questionContent: SurveyQuestionContent_Text
} | {
    id: string
    isRequired: boolean
    order: number
    questionType: SurveyQuestionType_SingleSelect
    questionContent: SurveyQuestionContent_SingleSelect
} | {
    id: string
    isRequired: boolean
    order: number
    questionType: SurveyQuestionType_MultiSelect
    questionContent: SurveyQuestionContent_MultiSelect
}/*  | {
    id: string
    isRequired: boolean
    order: number
    questionType: T
    questionContent: C
} */
```
