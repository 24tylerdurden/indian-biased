package handlers

import (
	"net/http"
	"strconv"

	"fmt"

	"github.com/24tylerdurden/indian-biased/database"
	"github.com/24tylerdurden/indian-biased/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func GetArticles(c *gin.Context) {
	status := c.DefaultQuery("status", "published")
	categoryIDStr := c.DefaultQuery("category_id", "")
	limitStr := c.DefaultQuery("limit", "20")
	offsetStr := c.DefaultQuery("offset", "0")

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 20
	}

	offset, err := strconv.Atoi(offsetStr)
	if err != nil || offset < 0 {
		offset = 0
	}

	var categoryID *int64
	if categoryIDStr != "" {
		id, err := strconv.ParseInt(categoryIDStr, 10, 64)
		if err == nil {
			categoryID = &id
		}
	}

	fmt.Println("the catery id is : ", categoryID)

	articles, err := models.GetAllArticles(database.DB, status, categoryID, limit, offset)
	if err != nil {
		fmt.Println("The err is : ", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch articles"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"articles": articles, "count": len(articles)})
}

func GetArticleBySlug(c *gin.Context) {
	slug := c.Param("slug")

	article, err := models.GetArticleBySlug(database.DB, slug)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Article not found"})
		return
	}

	c.JSON(http.StatusOK, article)
}

func CreateArticle(c *gin.Context) {
	var req models.CreateArticleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	article, err := models.CreateArticle(database.DB, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create article"})
		return
	}

	c.JSON(http.StatusCreated, article)
}

func CreatePerspective(c *gin.Context) {
	var req models.CreatePerspectiveRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	perspective, err := models.CreatePerspective(database.DB, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create perspective"})
		return
	}

	c.JSON(http.StatusCreated, perspective)
}

func GetCategories(c *gin.Context) {
	categories, err := models.GetAllCategories(database.DB)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"categories": categories,
	})
}

func CreateCategory(c *gin.Context) {
	var req struct {
		Name     string `json:"name" binding:"required"`
		Slug     string `json:"slug" binding:"required"`
		ParentID string `json:"parent_id"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var parentID *uuid.UUID
	if req.ParentID != "" {
		id, err := uuid.Parse(req.ParentID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid parent ID"})
			return
		}
		parentID = &id
	}

	category, err := models.CreateCategory(database.DB, req.Name, req.Slug, parentID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, category)
}

func PublishArticle(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid article ID"})
		return
	}

	if err := models.PublishArticle(database.DB, id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to publish article"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Article published successfully"})
}
