<script setup lang="ts">
import { computed, ref } from 'vue'
import type { AppState, NavActions } from '../types/navigation'
type VisitStatus='completed'|'skipped'|'rescheduled'|'upcoming'
interface Visit {day:number;status:VisitStatus;time?:string;crew?:string;service?:string;reason?:string;newDate?:string}
const props=defineProps<{state:AppState;actions:NavActions}>()
const img=(id:string,w=400,h=300)=>`https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&auto=format`
const visits:Record<number,Visit>={
  3:{day:3,status:'completed',time:'9:42 am – 10:35 am',crew:'Jake & Team',service:'Lawn Mowing'},
  10:{day:10,status:'skipped',reason:'Weather',service:'Lawn Mowing'},
  17:{day:17,status:'completed',time:'2:10 pm – 3:05 pm',crew:'Jake & Team',service:'Lawn Mowing'},
  24:{day:24,status:'rescheduled',newDate:'Thu 25 Sep',service:'Lawn Mowing'},
  25:{day:25,status:'upcoming',time:'9:00 am – 11:00 am',crew:'Jake & Team',service:'Lawn Mowing'},
}
const colors:Record<VisitStatus,string>={completed:'#16A34A',skipped:'#DC2626',rescheduled:'#B45309',upcoming:'#9CA3AF'}
const view=ref<'calendar'|'list'>('calendar')
const selectedDay=ref<number>(Number(props.state.selectedDate?.split('-').pop())||0)
const sliderPos=ref(50)
const visit=computed(()=>visits[selectedDay.value])
const status=computed(()=>visit.value ? ({
  completed:{bg:'#E8F5E9',color:'#16A34A',label:'Completed',icon:'✓'},skipped:{bg:'#FEF2F2',color:'#DC2626',label:'Visit skipped',icon:'✗'},
  rescheduled:{bg:'#FFFBEB',color:'#B45309',label:'Rescheduled by Evergro',icon:'↻'},upcoming:{bg:'#F3F4F6',color:'#6B7280',label:'Upcoming',icon:'○'},
}[visit.value.status]) : null)
const openDay=(day:number)=>{selectedDay.value=day;props.actions.goTo('day-detail',{selectedDate:`2024-09-${day}`})}
</script>
<template>
  <div v-if="state.screen==='day-detail'" class="pb-8">
    <div v-if="visit && status">
      <div class="mx-4 mt-4 rounded-2xl p-4" :style="{background:status.bg}"><div class="mb-1 flex items-center gap-2"><span class="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white" :style="{background:status.color}">{{ status.icon }}</span><span class="text-sm font-bold" :style="{color:status.color}">{{ status.label }}</span></div><p class="font-[Outfit] text-lg font-bold">{{ ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date(2024,8,selectedDay).getDay()] }}, {{ selectedDay }} Sep 2024</p><p class="text-sm text-gray-600">{{ visit.service }}</p></div>
      <template v-if="visit.status==='completed'">
        <div class="mx-4 mt-3 flex gap-4 rounded-2xl bg-white p-4 shadow-sm"><div class="flex-1 text-center"><p class="text-xs text-gray-400">Arrived</p><p class="font-bold text-[#073B24]">{{ visit.time?.split(' – ')[0] }}</p></div><div class="w-px bg-gray-100"/><div class="flex-1 text-center"><p class="text-xs text-gray-400">Finished</p><p class="font-bold text-[#073B24]">{{ visit.time?.split(' – ')[1] }}</p></div><div class="w-px bg-gray-100"/><div class="flex-1 text-center"><p class="text-xs text-gray-400">On site</p><p class="font-bold text-[#073B24]">53 min</p></div></div>
        <div class="mx-4 mt-3"><p class="mb-2 text-sm font-bold text-gray-700">Before & after</p><div class="relative h-[180px] overflow-hidden rounded-2xl"><img :src="img('1526392587392-d1627b6c134a',400,360)" alt="Before" class="absolute inset-0 h-full w-full object-cover grayscale opacity-60"/><div class="absolute inset-0 overflow-hidden" :style="{clipPath:`inset(0 ${100-sliderPos}% 0 0)`}"><img :src="img('1690068023694-053da714f95f',400,360)" alt="After" class="h-full w-full object-cover"/></div><div class="absolute inset-y-0 w-0.5 bg-white" :style="{left:`${sliderPos}%`}"/><input v-model.number="sliderPos" type="range" min="0" max="100" class="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"/><span class="absolute left-3 top-2 rounded-full bg-black/40 px-2 text-xs font-bold text-white">Before</span><span class="absolute right-3 top-2 rounded-full bg-[#073B24]/80 px-2 text-xs font-bold text-white">After</span></div></div>
        <div class="mx-4 mt-3 rounded-2xl bg-white p-4 shadow-sm"><p class="mb-3 text-sm font-bold">What we did</p><div v-for="task in ['Mowed lawn','Edged borders','Blew paths & driveway','Trimmed hedges']" :key="task" class="mb-2 flex items-center gap-2.5 text-sm"><span class="text-[#16A34A]">✓</span>{{ task }}</div></div>
        <div class="mx-4 mt-3 flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm"><img :src="img('1590820292118-e256c3ac2676',96,96)" alt="Crew" class="h-12 w-12 rounded-full object-cover"/><div><p class="text-sm font-semibold">{{ visit.crew }}</p><p class="text-xs text-gray-500">Dog toys moved to patio · Gate latched</p></div></div>
        <div class="mx-4 mt-4 flex flex-col gap-2.5"><button @click="actions.goTo('review')" class="w-full rounded-2xl bg-[#073B24] py-3.5 text-sm font-semibold text-white">Rate this visit</button><button @click="actions.goTo('ticket-form')" class="w-full rounded-2xl border-2 border-[#073B24] py-3.5 text-sm font-semibold text-[#073B24]">Report a problem</button></div>
      </template>
      <template v-else-if="visit.status==='skipped'"><div class="mx-4 mt-3 rounded-2xl bg-white p-4 shadow-sm"><p class="mb-2 font-semibold text-[#DC2626]">Weather — heavy rain</p><p class="text-sm text-gray-600">We couldn't mow today because of rain. No charge applies — your next visit rolls to the regular schedule.</p></div><div class="mx-4 mt-3 rounded-2xl bg-[#FEF2F2] p-4"><p class="text-xs font-bold text-[#DC2626]">What happens next</p><p class="mt-1 text-sm text-gray-600">Your next scheduled date remains Thu 25 Sep. No charge has been applied.</p></div></template>
      <template v-else-if="visit.status==='rescheduled'"><div class="mx-4 mt-3 rounded-2xl bg-white p-4 shadow-sm"><p class="mb-3 text-sm text-gray-600">Our crew had an equipment issue this morning. We're really sorry for the inconvenience.</p><div class="rounded-xl bg-[#FFFBEB] p-3"><p class="text-xs text-gray-500">New date</p><button @click="openDay(25)" class="text-sm font-bold text-[#B45309] underline">Thu 25 Sep, 9:00–11:00 am</button></div></div><div class="mx-4 mt-3 rounded-2xl bg-[#E6F0EB] p-3"><p class="text-xs font-bold text-[#073B24]">Goodwill gesture</p><p class="text-sm text-gray-600">We've applied a R 50 credit to your account as an apology.</p></div></template>
      <template v-else><div class="mx-4 mt-3 rounded-2xl bg-white p-4 shadow-sm"><p class="text-sm font-semibold">Your next visit is confirmed.</p><p class="mt-1 text-sm text-gray-500">{{ visit.time }} · {{ visit.crew }}</p></div></template>
    </div>
    <div v-else class="p-8 text-center"><p class="text-gray-500">No visit on this date.</p><button @click="actions.goTo('schedule')" class="mt-4 text-sm font-medium text-[#073B24]">Back to calendar</button></div>
  </div>
  <div v-else class="pb-8">
    <div class="mx-4 mb-4 mt-4 flex rounded-2xl bg-white p-1 shadow-sm"><button v-for="item in ['calendar','list'] as const" :key="item" @click="view=item" class="flex-1 rounded-xl py-2.5 text-sm font-semibold capitalize" :class="view===item ? 'bg-[#073B24] text-white' : 'text-gray-400'">{{ item }}</button></div>
    <div class="mb-3 flex items-center justify-between px-4"><button class="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow">‹</button><p class="font-[Outfit] font-bold">September 2024</p><div class="flex gap-2"><button class="rounded-full bg-[#E6F0EB] px-3 text-xs font-bold text-[#073B24]">Today</button><button class="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow">›</button></div></div>
    <div v-if="view==='calendar'" class="mx-4 rounded-3xl bg-white p-4 shadow-sm"><div class="mb-2 grid grid-cols-7"><div v-for="day in ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']" :key="day" class="py-1 text-center text-xs font-bold text-gray-400">{{ day }}</div></div><div class="grid grid-cols-7 gap-1"><div v-for="i in 6" :key="`empty${i}`"/><button v-for="day in 30" :key="day" @click="visits[day] && openDay(day)" class="flex flex-col items-center rounded-xl py-1.5" :class="day===21 ? 'bg-[#073B24] text-white' : ''"><span class="text-xs font-semibold">{{ day }}</span><span v-if="visits[day]" class="mt-0.5 h-2 w-2 rounded-full" :style="{background:visits[day].status==='upcoming'?'transparent':colors[visits[day].status],border:visits[day].status==='upcoming'?`1.5px solid ${colors.upcoming}`:'none'}"/><span v-else class="mt-0.5 h-2 w-2"/></button></div><div class="mt-4 flex flex-wrap gap-4 border-t border-gray-100 pt-4"><span v-for="item in ['completed','skipped','rescheduled','upcoming'] as const" :key="item" class="flex items-center gap-1.5 text-xs capitalize text-gray-500"><i class="h-2.5 w-2.5 rounded-full" :style="{background:item==='upcoming'?'transparent':colors[item],border:item==='upcoming'?`2px solid ${colors[item]}`:'none'}"/>{{ item }}</span></div></div>
    <div v-else class="mx-4 flex flex-col gap-3"><button v-for="item in Object.values(visits)" :key="item.day" @click="openDay(item.day)" class="flex items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-sm"><span class="flex h-11 w-11 items-center justify-center rounded-xl" :style="{color:colors[item.status]}">{{ item.status==='completed'?'✓':item.status==='skipped'?'✗':item.status==='rescheduled'?'↻':'○' }}</span><div><p class="text-sm font-semibold">Sep {{ item.day }} — {{ item.service }}</p><p class="text-xs capitalize text-gray-500">{{ item.status }} · {{ item.time || item.reason || item.newDate }}</p></div></button></div>
  </div>
</template>
