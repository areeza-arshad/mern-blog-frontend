// import axios from "axios";

// export const filterPaginationData  = async ({ create_new_arr =  false, state, data, page, countRoute, data_to_send = { }, user = undefined }) => {

//     let obj;
//     let headers = { };

//     if (user) {
//         headers.headers = {
//             'Authorization': `Bearer ${user}`
//         }
//     }


//     if (state !== null  && !create_new_arr) {
//         obj = { ...state, results: [...state.results, ...data ], page: page }
//     } else {
//         await axios.post(import.meta.env.VITE_SERVER_DOMAIN + countRoute, data_to_send, headers)
//         .then(({ data: {totalDocs }}) => {
//             obj = { results: data, page: 1, totalDocs }
//         })
//         .catch(err => {
//             console.log(err)
//              obj = { results: [], page: 1, totalDocs: 0 } // ✅ yeh line add karo
//         })
//     }
//      return obj;
// }
import axios from "axios";

export const filterPaginationData = async ({
    create_new_arr = false,
    state,
    data,
    page,
    countRoute,
    data_to_send = {},
    user = undefined
}) => {
  let obj;
  let headers = {};

  if (user) {
    headers.headers = {
      Authorization: `Bearer ${user}`
    };
  }

  const safeData = Array.isArray(data) ? data : [];
  const safeResults = Array.isArray(state?.results) ? state.results : [];

  if (state !== null && !create_new_arr) {
    obj = {
      ...state,
      results: [...safeResults, ...safeData],
      page: page
    };
  } else {
    try {
      const response = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + countRoute,
        data_to_send,
        headers
      );

      const { totalDocs } = response.data;
      obj = {
        results: safeData,
        page: 1,
        totalDocs: totalDocs || 0
      };
    } catch (err) {
      console.error("Pagination count fetch failed:", err);
      obj = {
        results: [],
        page: 1,
        totalDocs: 0
      };
    }
  }

  return obj;
};
