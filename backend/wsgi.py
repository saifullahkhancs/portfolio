from app import create_app

app = create_app()

if __name__ == "__main__":
    # Frontend runs on 6175, backend on 5175 as requested
    app.run(debug=True, host="0.0.0.0", port=5175)
