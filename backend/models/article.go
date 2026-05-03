package models

import (
	"database/sql/driver"
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

// JSONB type for PostgreSQL JSONB columns
type JSONB map[string]interface{}

func (j JSONB) Value() (driver.Value, error) {
	return json.Marshal(j)
}

func (j *JSONB) Scan(value interface{}) error {
	bytes, ok := value.([]byte)
	if !ok {
		return nil
	}
	return json.Unmarshal(bytes, j)
}

// StringArray type for PostgreSQL TEXT[] columns
type StringArray []string

func (s StringArray) Value() (driver.Value, error) {
	if s == nil {
		return nil, nil
	}
	return json.Marshal(s)
}

func (s *StringArray) Scan(value interface{}) error {
	bytes, ok := value.([]byte)
	if !ok {
		return nil
	}
	return json.Unmarshal(bytes, s)
}

type Category struct {
	ID        uuid.UUID  `db:"id" json:"id"`
	Name      string     `db:"name" json:"name"`
	Slug      string     `db:"slug" json:"slug"`
	ParentID  *uuid.UUID `db:"parent_id" json:"parent_id,omitempty"`
	CreatedAt time.Time  `db:"created_at" json:"created_at"`
	UpdatedAt time.Time  `db:"updated_at" json:"updated_at"`
}

type Article struct {
	ID          uuid.UUID  `db:"id" json:"id"`
	Slug        string     `db:"slug" json:"slug"`
	OriginalURL *string    `db:"original_url" json:"original_url,omitempty"`
	Topic       string     `db:"topic" json:"topic"`
	CategoryID  *uuid.UUID `db:"category_id" json:"category_id,omitempty"`
	Status      string     `db:"status" json:"status"`
	PublishedAt *time.Time `db:"published_at" json:"published_at,omitempty"`
	CreatedAt   time.Time  `db:"created_at" json:"created_at"`
	UpdatedAt   time.Time  `db:"updated_at" json:"updated_at"`
	Tags        StringArray `db:"tags" json:"tags,omitempty"`
	Metadata    JSONB      `db:"metadata" json:"metadata,omitempty"`
}

type Perspective struct {
	ID          uuid.UUID  `db:"id" json:"id"`
	ArticleID   uuid.UUID  `db:"article_id" json:"article_id"`
	Lean        string     `db:"lean" json:"lean"`
	LeanScore   *int16     `db:"lean_score" json:"lean_score,omitempty"`
	Headline    string     `db:"headline" json:"headline"`
	Summary     string     `db:"summary" json:"summary"`
	Body        *string    `db:"body" json:"body,omitempty"`
	SourceName  *string    `db:"source_name" json:"source_name,omitempty"`
	SourceURL   *string    `db:"source_url" json:"source_url,omitempty"`
	Sentiment   *string    `db:"sentiment" json:"sentiment,omitempty"`
	CreatedAt   time.Time  `db:"created_at" json:"created_at"`
}

type ArticleWithPerspectives struct {
	Article
	Category    *Category     `json:"category,omitempty"`
	Perspectives []Perspective `json:"perspectives"`
}

type CreateArticleRequest struct {
	Slug        string     `json:"slug" binding:"required"`
	OriginalURL *string    `json:"original_url"`
	Topic       string     `json:"topic" binding:"required"`
	CategoryID  *uuid.UUID `json:"category_id"`
	Status      string     `json:"status"`
	Tags        StringArray `json:"tags"`
	Metadata    JSONB      `json:"metadata"`
}

type CreatePerspectiveRequest struct {
	ArticleID  uuid.UUID  `json:"article_id" binding:"required"`
	Lean       string     `json:"lean" binding:"required"`
	LeanScore  *int16    `json:"lean_score"`
	Headline   string     `json:"headline" binding:"required"`
	Summary    string     `json:"summary" binding:"required"`
	Body       *string   `json:"body"`
	SourceName *string   `json:"source_name"`
	SourceURL  *string   `json:"source_url"`
	Sentiment  *string   `json:"sentiment"`
}

// Category functions
func CreateCategory(db *sqlx.DB, name, slug string, parentID *uuid.UUID) (*Category, error) {
	category := &Category{
		ID:       uuid.New(),
		Name:     name,
		Slug:     slug,
		ParentID: parentID,
	}

	query := `INSERT INTO categories (id, name, slug, parent_id) 
			  VALUES ($1, $2, $3, $4) RETURNING created_at, updated_at`

	err := db.QueryRow(query, category.ID, category.Name, category.Slug, category.ParentID).
		Scan(&category.CreatedAt, &category.UpdatedAt)
	if err != nil {
		return nil, err
	}

	return category, nil
}

func GetCategoryBySlug(db *sqlx.DB, slug string) (*Category, error) {
	var category Category
	query := `SELECT id, name, slug, parent_id, created_at, updated_at 
			  FROM categories WHERE slug = $1`
	err := db.Get(&category, query, slug)
	if err != nil {
		return nil, err
	}
	return &category, nil
}

func GetAllCategories(db *sqlx.DB) ([]Category, error) {
	var categories []Category
	query := `SELECT id, name, slug, parent_id, created_at, updated_at 
			  FROM categories ORDER BY name`
	err := db.Select(&categories, query)
	if err != nil {
		return nil, err
	}
	return categories, nil
}

// Article functions
func CreateArticle(db *sqlx.DB, req CreateArticleRequest) (*Article, error) {
	article := &Article{
		ID:          uuid.New(),
		Slug:        req.Slug,
		OriginalURL: req.OriginalURL,
		Topic:       req.Topic,
		CategoryID:  req.CategoryID,
		Status:      req.Status,
		Tags:        req.Tags,
		Metadata:    req.Metadata,
	}

	if article.Status == "" {
		article.Status = "draft"
	}

	query := `INSERT INTO articles (id, slug, original_url, topic, category_id, status, tags, metadata) 
			  VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING created_at, updated_at`

	err := db.QueryRow(query, article.ID, article.Slug, article.OriginalURL, article.Topic, 
		article.CategoryID, article.Status, article.Tags, article.Metadata).
		Scan(&article.CreatedAt, &article.UpdatedAt)
	if err != nil {
		return nil, err
	}

	return article, nil
}

func GetArticleBySlug(db *sqlx.DB, slug string) (*ArticleWithPerspectives, error) {
	var article Article
	query := `SELECT id, slug, original_url, topic, category_id, status, published_at, created_at, updated_at, tags, metadata 
			  FROM articles WHERE slug = $1`
	err := db.Get(&article, query, slug)
	if err != nil {
		return nil, err
	}

	// Get category if exists
	var category *Category
	if article.CategoryID != nil {
		cat, err := GetCategoryByID(db, *article.CategoryID)
		if err == nil {
			category = cat
		}
	}

	// Get perspectives
	perspectives, err := GetPerspectivesByArticleID(db, article.ID)
	if err != nil {
		return nil, err
	}

	return &ArticleWithPerspectives{
		Article:     article,
		Category:    category,
		Perspectives: perspectives,
	}, nil
}

func GetCategoryByID(db *sqlx.DB, id uuid.UUID) (*Category, error) {
	var category Category
	query := `SELECT id, name, slug, parent_id, created_at, updated_at 
			  FROM categories WHERE id = $1`
	err := db.Get(&category, query, id)
	if err != nil {
		return nil, err
	}
	return &category, nil
}

func GetAllArticles(db *sqlx.DB, status string, categoryID *uuid.UUID, limit, offset int) ([]Article, error) {
	var articles []Article
	var query string
	var args []interface{}

	baseQuery := `SELECT id, slug, original_url, topic, category_id, status, published_at, created_at, updated_at, tags, metadata 
				 FROM articles WHERE 1=1`

	if status != "" {
		baseQuery += " AND status = $1"
		args = append(args, status)
	}

	if categoryID != nil {
		if len(args) == 0 {
			baseQuery += " AND category_id = $1"
			args = append(args, categoryID)
		} else {
			baseQuery += " AND category_id = $2"
			args = append(args, categoryID)
		}
	}

	baseQuery += " ORDER BY published_at DESC NULLS LAST, created_at DESC LIMIT $"
	argCount := len(args) + 1
	baseQuery += string(rune(argCount + '0'))
	args = append(args, limit)

	argCount++
	baseQuery += " OFFSET $"
	baseQuery += string(rune(argCount + '0'))
	args = append(args, offset)

	query = baseQuery
	err := db.Select(&articles, query, args...)
	if err != nil {
		return nil, err
	}
	return articles, nil
}

func PublishArticle(db *sqlx.DB, id uuid.UUID) error {
	now := time.Now()
	query := `UPDATE articles SET status = 'published', published_at = $1 WHERE id = $2`
	_, err := db.Exec(query, now, id)
	return err
}

// Perspective functions
func CreatePerspective(db *sqlx.DB, req CreatePerspectiveRequest) (*Perspective, error) {
	perspective := &Perspective{
		ID:         uuid.New(),
		ArticleID:  req.ArticleID,
		Lean:       req.Lean,
		LeanScore:  req.LeanScore,
		Headline:   req.Headline,
		Summary:    req.Summary,
		Body:       req.Body,
		SourceName: req.SourceName,
		SourceURL:  req.SourceURL,
		Sentiment:  req.Sentiment,
	}

	query := `INSERT INTO perspectives (id, article_id, lean, lean_score, headline, summary, body, source_name, source_url, sentiment) 
			  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING created_at`

	err := db.QueryRow(query, perspective.ID, perspective.ArticleID, perspective.Lean, perspective.LeanScore,
		perspective.Headline, perspective.Summary, perspective.Body, perspective.SourceName, 
		perspective.SourceURL, perspective.Sentiment).
		Scan(&perspective.CreatedAt)
	if err != nil {
		return nil, err
	}

	return perspective, nil
}

func GetPerspectivesByArticleID(db *sqlx.DB, articleID uuid.UUID) ([]Perspective, error) {
	var perspectives []Perspective
	query := `SELECT id, article_id, lean, lean_score, headline, summary, body, source_name, source_url, sentiment, created_at 
			  FROM perspectives WHERE article_id = $1 ORDER BY created_at`
	err := db.Select(&perspectives, query, articleID)
	if err != nil {
		return nil, err
	}
	return perspectives, nil
}

func GetPerspectiveByID(db *sqlx.DB, id uuid.UUID) (*Perspective, error) {
	var perspective Perspective
	query := `SELECT id, article_id, lean, lean_score, headline, summary, body, source_name, source_url, sentiment, created_at 
			  FROM perspectives WHERE id = $1`
	err := db.Get(&perspective, query, id)
	if err != nil {
		return nil, err
	}
	return &perspective, nil
}
