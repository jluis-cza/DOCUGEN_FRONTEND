import { ref, computed } from 'vue';
import { ManagementService } from '../../services/docugen-web/ManagementService.js';
import { useNotificationStore } from '../../stores/utils/notificationStore.js';
import { useMyProfileStore } from '../../stores/docugen-web/myProfileStore.js';
import { useMyUsernameStore } from '../../stores/docugen-web/myUsernameStore.js';

export const useMyProfile = () => {
  // Notification setttings
  const notificationStore = useNotificationStore();
  const message = ref(null);
  const code = ref(null);
  //  Request settings
  const myProfileStore = useMyProfileStore();
  const myProfile = computed(() => myProfileStore.getMyProfile);
  // Petition settings
  const loading = ref(false);
  const success = ref(null);
  const actions = {
    myProfileSummaryGetter: async (id) => {
      try {
        const response = await ManagementService.getProfile(id);
        myProfileStore.setMyProfile(response.data.data.profile);
        return true;
      } catch (err) {
        console.error('Error in myProfileSummaryGetter.', err);
        return false;
      }
    },
    myProfileGetter: async (id) => {
      try {
        loading.value = true;
        const response = await ManagementService.getProfile(id);
        myProfileStore.setMyProfile(response.data.data.profile);
        message.value = response?.data?.message || response.statusText;
        success.value = response?.data?.success || false;
        code.value = response?.data?.code || 'EXXX';
      } catch (err) {
        console.error(err);
        message.value =
          err.response?.data?.message || err.response.statusText || 'Error in myProfileGetter';
        success.value = err.response?.data?.success || false;
        code.value = err.response?.data?.code || 'EXXX';
      } finally {
        loading.value = false;
        const data = {
          message: message.value,
          code: code.value,
          mode: 'automatic',
        };
        notificationStore.setNotification(data);
      }
    },
    myProfileSetter: async (id, payload) => {
      try {
        const myUsernameStore = useMyUsernameStore();
        loading.value = true;
        const response = await ManagementService.setProfile(id, payload);
        myProfileStore.setMyProfile(response.data.data.profile);
        myUsernameStore.setMyUsername(response.data.data.profile.username);
        message.value = response?.data?.message || response.statusText;
        success.value = response?.data?.success;
        code.value = response?.data?.code || 'EXXX';
      } catch (err) {
        console.error(err);
        message.value =
          err.response?.data?.message || err.response.statusText || 'Error in myProfileSetter';
        success.value = err.response?.data?.success;
        code.value = err.response?.data?.code || 'EXXX';
      } finally {
        loading.value = false;
        const data = {
          message: message.value,
          code: code.value,
          mode: 'automatic',
        };
        notificationStore.setNotification(data);
      }
    },
    profilePictureSetter: async (id, imageFile) => {
      try {
        loading.value = true;
        const response = await ManagementService.setProfilePicture(id, imageFile);
        myProfileStore.setMyProfile(response.data.data.profile);
        message.value = response?.data?.message || response.statusText;
        success.value = response?.data?.success || false;
        code.value = response?.data?.code || 'EXXX';
      } catch (err) {
        console.error(err);
        message.value =
          err.response?.data?.message ||
          err.response?.statusText ||
          'Error in profilePictureSetter';
        success.value = err.response?.data?.success || false;
        code.value = err.response?.data?.code || 'EXXX';
      } finally {
        loading.value = false;
        notificationStore.setNotification({
          message: message.value,
          code: code.value,
          mode: 'automatic',
        });
      }
    },
    profilePictureRemover: async (id) => {
      try {
        loading.value = true;
        const response = await ManagementService.removeProfilePicture(id);
        myProfileStore.setMyProfile(response.data.data.profile);
        message.value = response?.data?.message || response.statusText;
        success.value = response?.data?.success || false;
        code.value = response?.data?.code || 'EXXX';
      } catch (err) {
        console.error(err);
        message.value =
          err.response?.data?.message ||
          err.response?.statusText ||
          'Error in profilePictureRemover';
        success.value = err.response?.data?.success || false;
        code.value = err.response?.data?.code || 'EXXX';
      } finally {
        loading.value = false;
        notificationStore.setNotification({
          message: message.value,
          code: code.value,
          mode: 'automatic',
        });
      }
    },
  };

  return { myProfile, actions, loading, success, message, code };
};
