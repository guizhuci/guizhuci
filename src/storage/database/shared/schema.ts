import { pgTable, serial, varchar, integer, boolean, timestamp, index, foreignKey, text, jsonb, numeric, unique, date } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const subjects = pgTable("subjects", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	category: varchar({ length: 50 }),
	majorCategoryId: integer("major_category_id"),
	sortOrder: integer("sort_order").default(0),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const questions = pgTable("questions", {
	id: serial().primaryKey().notNull(),
	subjectId: integer("subject_id"),
	type: varchar({ length: 20 }).notNull(),
	questionText: text("question_text").notNull(),
	options: jsonb(),
	answer: text().notNull(),
	explanation: text(),
	difficulty: varchar({ length: 20 }),
	sortOrder: integer("sort_order").default(0),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_questions_subject").using("btree", table.subjectId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.subjectId],
			foreignColumns: [subjects.id],
			name: "questions_subject_id_fkey"
		}),
]);

export const examPapers = pgTable("exam_papers", {
	id: serial().primaryKey().notNull(),
	title: varchar({ length: 200 }).notNull(),
	subjectId: integer("subject_id"),
	duration: integer().default(150),
	totalScore: integer("total_score").default(100),
	isFree: boolean("is_free").default(false),
	price: numeric({ precision: 10, scale:  2 }).default('4.99'),
	sortOrder: integer("sort_order").default(0),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.subjectId],
			foreignColumns: [subjects.id],
			name: "exam_papers_subject_id_fkey"
		}),
]);

export const examPaperQuestions = pgTable("exam_paper_questions", {
	id: serial().primaryKey().notNull(),
	examPaperId: integer("exam_paper_id"),
	questionId: integer("question_id"),
	questionOrder: integer("question_order").notNull(),
	score: integer().default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.examPaperId],
			foreignColumns: [examPapers.id],
			name: "exam_paper_questions_exam_paper_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.questionId],
			foreignColumns: [questions.id],
			name: "exam_paper_questions_question_id_fkey"
		}),
]);

export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	openid: varchar({ length: 100 }).notNull(),
	phone: varchar({ length: 20 }),
	nickname: varchar({ length: 100 }),
	avatarUrl: varchar("avatar_url", { length: 500 }),
	deviceId: varchar("device_id", { length: 200 }),
	lastLoginAt: timestamp("last_login_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("users_openid_key").on(table.openid),
	unique("users_phone_key").on(table.phone),
]);

export const answerRecords = pgTable("answer_records", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id"),
	questionId: integer("question_id"),
	examPaperId: integer("exam_paper_id"),
	userAnswer: text("user_answer"),
	isCorrect: boolean("is_correct"),
	isCorrected: boolean("is_corrected").default(false),
	answerMode: varchar("answer_mode", { length: 20 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_answer_records_user").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "answer_records_user_id_fkey"
		}),
	foreignKey({
			columns: [table.questionId],
			foreignColumns: [questions.id],
			name: "answer_records_question_id_fkey"
		}),
	foreignKey({
			columns: [table.examPaperId],
			foreignColumns: [examPapers.id],
			name: "answer_records_exam_paper_id_fkey"
		}),
]);

export const mistakes = pgTable("mistakes", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id"),
	questionId: integer("question_id"),
	examPaperId: integer("exam_paper_id"),
	source: varchar({ length: 50 }),
	subjectId: integer("subject_id"),
	firstMistakeAt: timestamp("first_mistake_at", { mode: 'string' }).defaultNow(),
	reviewCount: integer("review_count").default(0),
	isMastered: boolean("is_mastered").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_mistakes_user").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "mistakes_user_id_fkey"
		}),
	foreignKey({
			columns: [table.questionId],
			foreignColumns: [questions.id],
			name: "mistakes_question_id_fkey"
		}),
	foreignKey({
			columns: [table.examPaperId],
			foreignColumns: [examPapers.id],
			name: "mistakes_exam_paper_id_fkey"
		}),
	foreignKey({
			columns: [table.subjectId],
			foreignColumns: [subjects.id],
			name: "mistakes_subject_id_fkey"
		}),
]);

export const vipCodes = pgTable("vip_codes", {
	id: serial().primaryKey().notNull(),
	code: varchar({ length: 100 }).notNull(),
	type: varchar({ length: 50 }).notNull(),
	targetId: integer("target_id"),
	isUsed: boolean("is_used").default(false),
	usedBy: integer("used_by"),
	usedAt: timestamp("used_at", { mode: 'string' }),
	validUntil: date("valid_until"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_vip_codes_code").using("btree", table.code.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.usedBy],
			foreignColumns: [users.id],
			name: "vip_codes_used_by_fkey"
		}),
	unique("vip_codes_code_key").on(table.code),
]);

export const orders = pgTable("orders", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id"),
	type: varchar({ length: 50 }).notNull(),
	targetId: integer("target_id"),
	amount: numeric({ precision: 10, scale:  2 }),
	status: varchar({ length: 20 }).default('paid'),
	paymentMethod: varchar("payment_method", { length: 20 }).default('vip_code'),
	validUntil: date("valid_until"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "orders_user_id_fkey"
		}),
]);

export const news = pgTable("news", {
	id: serial().primaryKey().notNull(),
	title: varchar({ length: 200 }).notNull(),
	summary: text(),
	content: text(),
	coverImage: varchar("cover_image", { length: 500 }),
	source: varchar({ length: 100 }),
	sourceUrl: varchar("source_url", { length: 500 }),
	isActive: boolean("is_active").default(true),
	sortOrder: integer("sort_order").default(0),
	viewCount: integer("view_count").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const dailyFreeQuestions = pgTable("daily_free_questions", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id"),
	questionId: integer("question_id"),
	answerDate: date("answer_date").default(sql`CURRENT_DATE`),
	userAnswer: text("user_answer"),
	isCorrect: boolean("is_correct"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_daily_free_questions_user_date").using("btree", table.userId.asc().nullsLast().op("int4_ops"), table.answerDate.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "daily_free_questions_user_id_fkey"
		}),
	foreignKey({
			columns: [table.questionId],
			foreignColumns: [questions.id],
			name: "daily_free_questions_question_id_fkey"
		}),
	unique("daily_free_questions_user_id_question_id_answer_date_key").on(table.userId, table.questionId, table.answerDate),
]);

export const userUnlocks = pgTable("user_unlocks", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id"),
	type: varchar({ length: 50 }).notNull(),
	targetId: integer("target_id"),
	unlockMethod: varchar("unlock_method", { length: 20 }),
	validUntil: date("valid_until"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_user_unlocks_user").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_unlocks_user_id_fkey"
		}),
	unique("user_unlocks_user_id_type_target_id_key").on(table.userId, table.type, table.targetId),
]);

export const feedbacks = pgTable("feedbacks", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id"),
	content: text().notNull(),
	contactInfo: varchar("contact_info", { length: 200 }),
	status: varchar({ length: 20 }).default('pending'),
	reply: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "feedbacks_user_id_fkey"
		}),
]);

export const majorCategories = pgTable("major_categories", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	code: varchar({ length: 20 }),
	sortOrder: integer("sort_order").default(0),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const schools = pgTable("schools", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 200 }).notNull(),
	category: varchar({ length: 50 }),
	province: varchar({ length: 50 }),
	city: varchar({ length: 50 }),
	level: varchar({ length: 50 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const majors = pgTable("majors", {
	id: serial().primaryKey().notNull(),
	schoolId: integer("school_id"),
	name: varchar({ length: 200 }).notNull(),
	code: varchar({ length: 20 }),
	category: varchar({ length: 50 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.schoolId],
			foreignColumns: [schools.id],
			name: "majors_school_id_fkey"
		}),
]);

export const admissionScores = pgTable("admission_scores", {
	id: serial().primaryKey().notNull(),
	majorId: integer("major_id"),
	year: integer().notNull(),
	category: varchar({ length: 50 }),
	minScore: integer("min_score"),
	avgScore: integer("avg_score"),
	maxScore: integer("max_score"),
	admissionRate: numeric("admission_rate", { precision: 5, scale:  2 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.majorId],
			foreignColumns: [majors.id],
			name: "admission_scores_major_id_fkey"
		}),
]);
