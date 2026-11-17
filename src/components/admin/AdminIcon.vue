<script setup>
defineProps({ name: { type: String, required: true } });
const icones = {
  book: 'mdi-book-open-page-variant',
  dashboard: 'mdi-view-dashboard-outline',
  users: 'mdi-account-group-outline',
  orders: 'mdi-clipboard-text-outline',
  star: 'mdi-star-outline',
  user: 'mdi-account-outline',
  plus: 'mdi-plus',
  eye: 'mdi-eye-outline',
  edit: 'mdi-pencil-outline',
  trash: 'mdi-delete-outline',
  lock: 'mdi-lock-outline',
  close: 'mdi-close',
  chevron: 'mdi-chevron-down',
  back: 'mdi-chevron-left',
  menu: 'mdi-menu',
};
</script>

<template>
  <v-icon
    :icon="icones[name] || icones.book"
    class="admin-icon"
    aria-hidden="true"
  />
</template>

<style>
.admin-icon {
  font-size: 18px;
  width: 18px;
  height: 18px;
}
</style>
