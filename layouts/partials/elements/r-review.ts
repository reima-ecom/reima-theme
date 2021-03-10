const postReview = async (formData: FormData) => {
  const review = {
    // @ts-ignore
    appkey: window.site.yotpo.appkey,
    // @ts-ignore
    sku: window.yotpoId,
    product_title: document.getElementById('product-name')!.innerText,
    product_url: document.location.href,
    display_name: formData.get('name')!.toString(),
    email: formData.get('email')!.toString(),
    review_content: formData.get('content')!.toString(),
    review_title: formData.get('title')!.toString(),
    review_score: Number.parseInt(formData.get('score')!.toString(), 10),
  };
  const resp = await fetch('https://api.yotpo.com/v1/widget/reviews', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(review),
  });
  if (!resp.ok) throw new Error('Could not create');
};

document.forms.namedItem('review')!.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target as HTMLFormElement;
  try {
    const formData = new FormData(form);
    await postReview(formData);
    form.parentElement!.classList.remove('open');
    form.parentElement!.classList.add('thank-you');
  } catch (error) {
    form.querySelector('[error]')!.innerHTML = 'Sorry, something went wrong!';
  }
});
