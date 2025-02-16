styles: [`
  .listas-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .listas-header {
    text-align: center;
    padding: 2rem;
    background: linear-gradient(135deg, var(--primary-green) 0%, var(--secondary-green) 100%);
    color: white;
    border-radius: 16px;
    box-shadow: var(--shadow-lg);
    margin: 1rem;

    h1 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      color: white;
    }

    .subtitle {
      font-size: 1.2rem;
      opacity: 0.9;
    }
  }

  .listas-grid {
    flex: 1;
    overflow: auto;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1rem;
    padding: 1rem;
  }

  // ... rest of existing styles ...
`] 