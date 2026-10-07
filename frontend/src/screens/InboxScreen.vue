<script setup lang="ts">
import { computed, ref } from 'vue'
import type { AppState, NavActions } from '../types/navigation'
interface Notification { id:number; type:string; title:string; body:string; time:string; read:boolean; group:'Today'|'This week'|'Earlier' }
const props = defineProps<{ state: AppState; actions: NavActions }>()
const notifications = ref<Notification[]>([
  {id:1,type:'rescheduled',title:'Visit rescheduled',body:'Your Wed visit has moved to Thu 25 Sep due to rain.',time:'2h ago',read:false,group:'Today'},
  {id:2,type:'invoice',title:'Invoice ready',body:'Your invoice for September is ready. Total: R 250.',time:'5h ago',read:false,group:'Today'},
  {id:3,type:'review',title:'How did we do?',body:'Rate your Tue 17 Sep visit with Jake & Team.',time:'1d ago',read:false,group:'This week'},
  {id:4,type:'completed',title:'Visit completed',body:'Jake & Team finished your lawn at 3:05 pm. Looks great!',time:'4d ago',read:true,group:'This week'},
  {id:5,type:'reminder',title:"We're coming tomorrow",body:'Jake & Team arrive tomorrow, Tue 17 Sep, 2:00–4:00 pm. Move toys, unlock gate.',time:'5d ago',read:true,group:'This week'},
  {id:6,type:'promo',title:'Spring special',body:'Free fertilise with your next mow. Offer ends 30 Sep.',time:'1w ago',read:true,group:'Earlier'},
  {id:7,type:'support',title:'Ticket #001 resolved',body:'Your query about billing has been marked as resolved.',time:'2w ago',read:true,group:'Earlier'},
])
const selected = ref<Notification | null>(null)
const groups = ['Today','This week','Earlier'] as const
const unreadCount = computed(() => notifications.value.filter(item => !item.read).length)
const icons: Record<string,string> = {reminder:'◷',completed:'✓',rescheduled:'↻',invoice:'▣',promo:'★',review:'★',support:'?'}
const backgrounds: Record<string,string> = {reminder:'#E6F0EB',completed:'#E8F5E9',rescheduled:'#FFFBEB',invoice:'#F0F9FF',promo:'#FEF9C3',review:'#FFF7ED',support:'#F9FAFB'}
const open = (item: Notification) => { item.read = true; selected.value = item; props.actions.goTo('notification-detail') }
</script>
<template>
  <div v-if="state.screen === 'notification-detail' && selected" class="pb-8"><div class="mx-4 mt-4"><div class="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-3xl" :style="{background: backgrounds[selected.type]}">{{ icons[selected.type] }}</div><h2 class="font-[Outfit] text-xl font-bold">{{ selected.title }}</h2><p class="mt-1 text-xs text-gray-400">{{ selected.time }}</p><p class="mt-4 text-sm leading-relaxed text-gray-600">{{ selected.body }}</p><div class="mt-6"><button v-if="selected.type==='rescheduled'" @click="actions.setTab('schedule')" class="w-full rounded-2xl bg-[#073B24] py-3.5 text-sm font-semibold text-white">View in Schedule</button><button v-else-if="selected.type==='invoice'" @click="actions.goTo('account-billing')" class="w-full rounded-2xl bg-[#073B24] py-3.5 text-sm font-semibold text-white">View Invoice</button><button v-else-if="selected.type==='review'" @click="actions.goTo('review')" class="w-full rounded-2xl bg-[#073B24] py-3.5 text-sm font-semibold text-white">Rate your visit</button><button v-else-if="selected.type==='support'" @click="actions.goTo('ticket-detail')" class="w-full rounded-2xl bg-[#073B24] py-3.5 text-sm font-semibold text-white">View ticket</button></div></div></div>
  <div v-else class="pb-8">
    <div class="mb-4 flex items-center justify-between px-4 pt-4"><span v-if="unreadCount" class="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">{{ unreadCount }} new</span><span v-else/><button @click="notifications.forEach(item => item.read=true)" class="text-xs font-semibold text-[#073B24]">Mark all read</button></div>
    <div v-for="group in groups" :key="group" class="mb-4"><template v-if="notifications.some(item => item.group===group)"><p class="mb-2 px-4 text-xs font-bold uppercase tracking-wider text-gray-400">{{ group }}</p><button v-for="item in notifications.filter(item => item.group===group)" :key="item.id" @click="open(item)" class="flex w-full items-start gap-3 border-b border-gray-100 px-4 py-3 active:bg-gray-50"><div class="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl" :style="{background: backgrounds[item.type]}">{{ icons[item.type] }}</div><div class="min-w-0 flex-1 text-left"><div class="flex items-center gap-2"><p class="text-sm font-semibold text-gray-800">{{ item.title }}</p><span v-if="!item.read" class="h-2 w-2 rounded-full bg-[#073B24]"/></div><p class="mt-0.5 line-clamp-2 text-xs leading-relaxed text-gray-500">{{ item.body }}</p><p class="mt-1 text-[10px] text-gray-400">{{ item.time }}</p></div></button></template></div>
    <div v-if="!unreadCount" class="px-8 py-16 text-center"><p class="font-semibold text-gray-700">You're all caught up!</p><p class="mt-1 text-sm text-gray-400">No unread notifications</p></div>
  </div>
</template>
