import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { AdministrationService } from '../../services/docugen-web/AdministrationService.js';
import { TABLES } from '../../constants/tables.js';

export const useSystemParametersStore = defineStore('systemParameters', () => {
  // States
  const systemParameters = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const defaultPagination = TABLES.default.pagination;
  const pagination = ref({ ...defaultPagination });
  const defaultSort = TABLES.default.sort;
  const sort = ref({ ...defaultSort });
  const search = ref('');

  //Getters
  const getSystemParameters = computed(() => systemParameters.value);
  const isLoading = computed(() => loading.value);
  const viewError = computed(() => error.value);
  const viewPagination = computed(() => pagination.value);
  const viewSort = computed(() => sort.value);
  const viewSearch = computed(() => search.value);

  // Actions
  const setSystemParameters = (data) => {
    systemParameters.value = data || [];
  };
  const resetSystemParameters = () => {
    systemParameters.value = [];
  };
  const fetchSystemParameters = async () => {
    loading.value = true;
    error.value = null;
    try {
      const params = {
        page: pagination.value.page,
        limit: pagination.value.limit,
        sortBy: sort.value.by,
        sortOrder: sort.value.order,
        search: search.value,
      };
      const response = await AdministrationService.monitorSystemParameters(params);
      const success = response.data.success;
      const data = response.data.data;
      const paginationData = response.data.pagination;
      if (success) {
        setSystemParameters(data);
        pagination.value = {
          ...pagination.value,
          total: paginationData.total,
          totalPages: paginationData.totalPages,
        };
      } else {
        console.log('no se mando nada');
      }
    } catch (err) {
      error.value = err.message;
      console.error('Error loading the system parameters:', err);
    } finally {
      loading.value = false;
    }
  };
  const setPage = (page) => {
    pagination.value.page = page;
  };
  const setLimit = (limit) => {
    pagination.value.limit = limit;
    // setPage(1);
  };
  const setSort = (by, order) => {
    sort.value.by = by;
    sort.value.order = order;
  };
  const setSearch = (term) => {
    search.value = term;
    setPage(1);
  };

  return {
    //States
    systemParameters,
    loading,
    error,
    pagination,
    sort,
    search,
    //Getters
    getSystemParameters,
    isLoading,
    viewError,
    viewPagination,
    viewSort,
    viewSearch,
    //Actions
    setSystemParameters,
    resetSystemParameters,
    fetchSystemParameters,
    setPage,
    setLimit,
    setSort,
    setSearch,
  };
});
