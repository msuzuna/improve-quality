export const fetchData = async (url: string) => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`リクエストに失敗しました: ${response.status}`);
  }

  /** @type {Json} */
  const json = await response.json();
  const { data, ok } = json;
  if (ok) {
    return data;
  } else {
    throw new Error(`データが取得できませんでした`);
  }
};
