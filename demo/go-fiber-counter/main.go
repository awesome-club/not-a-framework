package main

import (
	"github.com/labstack/echo/v4"
	"html/template"
	"io"
	"log"
	"net/http"
)

type CountBody struct {
	Count string `json:"count"`
}

type TemplateRenderer struct {
	templates *template.Template
}

func (t *TemplateRenderer) Render(w io.Writer, name string, data interface{}, c echo.Context) error {
	return t.templates.ExecuteTemplate(w, name, data)
}

var cachedCount = "0"

func main() {
	e := echo.New()

	renderer := &TemplateRenderer{
		templates: template.Must(template.ParseGlob("templates/*.html")),
	}
	e.Renderer = renderer

	e.Static("/static", "static")

	e.GET("/", func(c echo.Context) error {
		return c.Render(200, "index.html", struct {
			Count string
		}{Count: cachedCount})
	})

	e.GET("/count", func(c echo.Context) error {
		return c.String(http.StatusOK, cachedCount)
	})

	e.POST("/count", func(c echo.Context) error {
		b := new(CountBody)
		if err := c.Bind(b); err != nil {
			log.Fatal(err)
		}
		cachedCount = b.Count
		log.Println(b.Count)
		log.Println(cachedCount)
		return c.NoContent(http.StatusOK)
	})

	e.Logger.Fatal(e.Start(":8000"))
}
