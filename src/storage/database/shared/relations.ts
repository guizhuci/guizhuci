import { relations } from "drizzle-orm/relations";
import { subjects, questions, examPapers, examPaperQuestions, users, answerRecords, mistakes, vipCodes, orders, dailyFreeQuestions, userUnlocks, feedbacks, schools, majors, admissionScores } from "./schema";

export const questionsRelations = relations(questions, ({one, many}) => ({
	subject: one(subjects, {
		fields: [questions.subjectId],
		references: [subjects.id]
	}),
	examPaperQuestions: many(examPaperQuestions),
	answerRecords: many(answerRecords),
	mistakes: many(mistakes),
	dailyFreeQuestions: many(dailyFreeQuestions),
}));

export const subjectsRelations = relations(subjects, ({many}) => ({
	questions: many(questions),
	examPapers: many(examPapers),
	mistakes: many(mistakes),
}));

export const examPapersRelations = relations(examPapers, ({one, many}) => ({
	subject: one(subjects, {
		fields: [examPapers.subjectId],
		references: [subjects.id]
	}),
	examPaperQuestions: many(examPaperQuestions),
	answerRecords: many(answerRecords),
	mistakes: many(mistakes),
}));

export const examPaperQuestionsRelations = relations(examPaperQuestions, ({one}) => ({
	examPaper: one(examPapers, {
		fields: [examPaperQuestions.examPaperId],
		references: [examPapers.id]
	}),
	question: one(questions, {
		fields: [examPaperQuestions.questionId],
		references: [questions.id]
	}),
}));

export const answerRecordsRelations = relations(answerRecords, ({one}) => ({
	user: one(users, {
		fields: [answerRecords.userId],
		references: [users.id]
	}),
	question: one(questions, {
		fields: [answerRecords.questionId],
		references: [questions.id]
	}),
	examPaper: one(examPapers, {
		fields: [answerRecords.examPaperId],
		references: [examPapers.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	answerRecords: many(answerRecords),
	mistakes: many(mistakes),
	vipCodes: many(vipCodes),
	orders: many(orders),
	dailyFreeQuestions: many(dailyFreeQuestions),
	userUnlocks: many(userUnlocks),
	feedbacks: many(feedbacks),
}));

export const mistakesRelations = relations(mistakes, ({one}) => ({
	user: one(users, {
		fields: [mistakes.userId],
		references: [users.id]
	}),
	question: one(questions, {
		fields: [mistakes.questionId],
		references: [questions.id]
	}),
	examPaper: one(examPapers, {
		fields: [mistakes.examPaperId],
		references: [examPapers.id]
	}),
	subject: one(subjects, {
		fields: [mistakes.subjectId],
		references: [subjects.id]
	}),
}));

export const vipCodesRelations = relations(vipCodes, ({one}) => ({
	user: one(users, {
		fields: [vipCodes.usedBy],
		references: [users.id]
	}),
}));

export const ordersRelations = relations(orders, ({one}) => ({
	user: one(users, {
		fields: [orders.userId],
		references: [users.id]
	}),
}));

export const dailyFreeQuestionsRelations = relations(dailyFreeQuestions, ({one}) => ({
	user: one(users, {
		fields: [dailyFreeQuestions.userId],
		references: [users.id]
	}),
	question: one(questions, {
		fields: [dailyFreeQuestions.questionId],
		references: [questions.id]
	}),
}));

export const userUnlocksRelations = relations(userUnlocks, ({one}) => ({
	user: one(users, {
		fields: [userUnlocks.userId],
		references: [users.id]
	}),
}));

export const feedbacksRelations = relations(feedbacks, ({one}) => ({
	user: one(users, {
		fields: [feedbacks.userId],
		references: [users.id]
	}),
}));

export const majorsRelations = relations(majors, ({one, many}) => ({
	school: one(schools, {
		fields: [majors.schoolId],
		references: [schools.id]
	}),
	admissionScores: many(admissionScores),
}));

export const schoolsRelations = relations(schools, ({many}) => ({
	majors: many(majors),
}));

export const admissionScoresRelations = relations(admissionScores, ({one}) => ({
	major: one(majors, {
		fields: [admissionScores.majorId],
		references: [majors.id]
	}),
}));