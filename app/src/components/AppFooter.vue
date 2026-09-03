<template>
  <footer class="footer">
    <p class="name">Pere Torres Escayola</p>
    <p class="links">
      <a href="mailto:ptescayola@gmail.com">ptescayola@gmail.com</a>
      <span aria-hidden="true">·</span>
      <a
        href="https://www.linkedin.com/in/pere-torres/"
        target="_blank"
        rel="noopener noreferrer"
      >
        LinkedIn
      </a>
    </p>
  </footer>
</template>

<style scoped>
.footer {
  margin-top: auto;
  padding: 1.25rem;
  border-top: 1px solid var(--border);
  background: var(--surface-muted);
  text-align: center;
}

.name {
  margin: 0 0 0.35rem;
  color: var(--text);
  font-size: 0.9rem;
  font-weight: 600;
}

.links {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.85rem;
}

.links span {
  margin: 0 0.5rem;
  opacity: 0.5;
}

.links a {
  color: var(--green);
  text-decoration: none;
}

.links a:hover {
  text-decoration: underline;
}
</style>
