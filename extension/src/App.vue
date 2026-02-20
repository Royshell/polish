<script setup lang="ts"></script>

<template>
  <div class="polish-panel">
    <header class="polish-header">
      <span class="polish-title">
        <span class="white">Pol</span><span class="red">ish</span>
      </span>
    </header>

    <main class="polish-body">
      <p>✨ Polish your website ✨</p>
      <textarea placeholder="Make this website look like a Japanese garden…" />
      <button class="action-btn">Analyze Page</button>
    </main>
  </div>
</template>

<style>
/* עיצוב שמתאים לכל גודל חלון שהמשתמש יבחר */
body {
  margin: 0;
  padding: 0;
  background-color: #111;
  color: white;
  font-family: system-ui, sans-serif;
}

.polish-panel {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.polish-header {
  padding: 16px;
  border-bottom: 1px solid #333;
  font-weight: bold;
  font-size: 20px;
}

.red {
  color: #dc143c;
}

.polish-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

textarea {
  width: 100%;
  height: 150px;
  background: #000;
  color: #0f0;
  border: 1px solid #333;
  padding: 10px;
  border-radius: 4px;
}

.action-btn {
  background: #dc143c;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 4px;
  cursor: pointer;
}
</style>
