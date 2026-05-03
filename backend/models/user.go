package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type User struct {
	ID           uuid.UUID `db:"id" json:"id"`
	Email        string    `db:"email" json:"email"`
	PasswordHash *string   `db:"password_hash" json:"-"`
	Name         string    `db:"name" json:"name"`
	AvatarURL    *string   `db:"avatar_url" json:"avatar_url,omitempty"`
	IsActive     bool      `db:"is_active" json:"is_active"`
	CreatedAt    time.Time `db:"created_at" json:"created_at"`
	UpdatedAt    time.Time `db:"updated_at" json:"updated_at"`
}

type OAuthAccount struct {
	ID               uuid.UUID  `db:"id" json:"id"`
	UserID           uuid.UUID  `db:"user_id" json:"user_id"`
	Provider         string     `db:"provider" json:"provider"`
	ProviderUserID   string     `db:"provider_user_id" json:"provider_user_id"`
	AccessToken      *string    `db:"access_token" json:"-"`
	RefreshToken     *string    `db:"refresh_token" json:"-"`
	TokenExpiresAt   *time.Time `db:"token_expires_at" json:"-"`
	CreatedAt        time.Time  `db:"created_at" json:"created_at"`
	UpdatedAt        time.Time  `db:"updated_at" json:"updated_at"`
}

type Session struct {
	ID           uuid.UUID `db:"id" json:"id"`
	UserID       uuid.UUID `db:"user_id" json:"user_id"`
	RefreshToken string    `db:"refresh_token" json:"-"`
	ExpiresAt    time.Time `db:"expires_at" json:"expires_at"`
	CreatedAt    time.Time `db:"created_at" json:"created_at"`
}

type CreateUserRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
	Name     string `json:"name" binding:"required,min=2"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type AuthResponse struct {
	User         User   `json:"user"`
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

func CreateUser(db *sqlx.DB, email, passwordHash, name string) (*User, error) {
	user := &User{
		ID:           uuid.New(),
		Email:        email,
		PasswordHash: &passwordHash,
		Name:         name,
		IsActive:     true,
	}

	query := `INSERT INTO users (id, email, password_hash, name, is_active) 
			  VALUES ($1, $2, $3, $4, $5) RETURNING created_at, updated_at`

	err := db.QueryRow(query, user.ID, user.Email, user.PasswordHash, user.Name, user.IsActive).
		Scan(&user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		return nil, err
	}

	return user, nil
}

func GetUserByEmail(db *sqlx.DB, email string) (*User, error) {
	var user User
	query := `SELECT id, email, password_hash, name, avatar_url, is_active, created_at, updated_at 
			  FROM users WHERE email = $1 AND is_active = true`
	err := db.Get(&user, query, email)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func GetUserByID(db *sqlx.DB, id uuid.UUID) (*User, error) {
	var user User
	query := `SELECT id, email, password_hash, name, avatar_url, is_active, created_at, updated_at 
			  FROM users WHERE id = $1 AND is_active = true`
	err := db.Get(&user, query, id)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func CreateOAuthUser(db *sqlx.DB, email, name, provider, providerUserID string, avatarURL *string) (*User, error) {
	user := &User{
		ID:        uuid.New(),
		Email:     email,
		Name:      name,
		AvatarURL: avatarURL,
		IsActive:  true,
	}

	tx, err := db.Beginx()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	query := `INSERT INTO users (id, email, name, avatar_url, is_active) 
			  VALUES ($1, $2, $3, $4, $5) RETURNING created_at, updated_at`
	err = tx.QueryRow(query, user.ID, user.Email, user.Name, user.AvatarURL, user.IsActive).
		Scan(&user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		return nil, err
	}

	oauthAccount := &OAuthAccount{
		ID:             uuid.New(),
		UserID:         user.ID,
		Provider:       provider,
		ProviderUserID: providerUserID,
	}

	oauthQuery := `INSERT INTO oauth_accounts (id, user_id, provider, provider_user_id) 
				   VALUES ($1, $2, $3, $4) RETURNING created_at, updated_at`
	err = tx.QueryRow(oauthQuery, oauthAccount.ID, oauthAccount.UserID, oauthAccount.Provider, oauthAccount.ProviderUserID).
		Scan(&oauthAccount.CreatedAt, &oauthAccount.UpdatedAt)
	if err != nil {
		return nil, err
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	return user, nil
}

func GetOAuthAccount(db *sqlx.DB, provider, providerUserID string) (*OAuthAccount, error) {
	var account OAuthAccount
	query := `SELECT id, user_id, provider, provider_user_id, created_at, updated_at 
			  FROM oauth_accounts WHERE provider = $1 AND provider_user_id = $2`
	err := db.Get(&account, query, provider, providerUserID)
	if err != nil {
		return nil, err
	}
	return &account, nil
}

func CreateSession(db *sqlx.DB, userID uuid.UUID, refreshToken string, expiresAt time.Time) (*Session, error) {
	session := &Session{
		ID:           uuid.New(),
		UserID:       userID,
		RefreshToken: refreshToken,
		ExpiresAt:    expiresAt,
	}

	query := `INSERT INTO sessions (id, user_id, refresh_token, expires_at) 
			  VALUES ($1, $2, $3, $4) RETURNING created_at`
	err := db.QueryRow(query, session.ID, session.UserID, session.RefreshToken, session.ExpiresAt).
		Scan(&session.CreatedAt)
	if err != nil {
		return nil, err
	}

	return session, nil
}

func GetSessionByRefreshToken(db *sqlx.DB, refreshToken string) (*Session, error) {
	var session Session
	query := `SELECT id, user_id, refresh_token, expires_at, created_at 
			  FROM sessions WHERE refresh_token = $1 AND expires_at > NOW()`
	err := db.Get(&session, query, refreshToken)
	if err != nil {
		return nil, err
	}
	return &session, nil
}

func DeleteSession(db *sqlx.DB, refreshToken string) error {
	query := `DELETE FROM sessions WHERE refresh_token = $1`
	_, err := db.Exec(query, refreshToken)
	return err
}

func DeleteUserSessions(db *sqlx.DB, userID uuid.UUID) error {
	query := `DELETE FROM sessions WHERE user_id = $1`
	_, err := db.Exec(query, userID)
	return err
}
