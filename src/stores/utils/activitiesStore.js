// This store stores the activities FETCHED from the database
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { deepMerge } from '../../helpers/utils';
import { toRaw } from 'vue';
import { extractTime } from '../../helpers/utils.js';

export const useActivitiesStore = defineStore('activities', () => {
  // States
  const activities = ref([]);

  //Getters
  const getAllActivities = computed(() => activities.value);
  const getDateActivities = computed(() => {
    const sections = [];
    for (const activity of activities.value) {
      const activityDate = extractTime(activity.createdAt, 'America/La_Paz', 'long').date;
      const section = sections.find((section) => section.date === activityDate);
      if (section) {
        section.activities.push(activity);
      } else {
        sections.push({ date: activityDate, activities: [activity] });
      }
    }
    return sections;
  });

  const getActivity = (id) => {
    const index = activities.value.findIndex((a) => a._id === id);
    if (index !== -1) {
      return activities.value[index];
    } else {
      return {};
    }
  };
  // Actions
  const setActivities = (data) => {
    activities.value = data || [];
  };
  const setActivity = (id, options) => {
    const index = activities.value.findIndex((a) => a._id === id);
    if (index !== -1) {
      activities.value[index] = deepMerge(toRaw(activities.value[index]), options);
    } else {
      activities.value.push(options);
      console.log('Se insertó un nuevo documento en el ActivitiesStore!!!');
    }
  };
  const resetActivities = () => {
    activities.value = [];
  };

  return {
    //Getters
    getAllActivities,
    getDateActivities,
    getActivity,
    //Actions
    setActivities,
    setActivity,
    resetActivities,
  };
});
