import type { NewPost } from '../../db/schema/blog/post'

export const blogSeed: NewPost[] = [
	{
		content: `
This is a good article

# What to do

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec magna odio, posuere sodales sapien id, semper ultrices nisi. Mauris id diam ut urna maximus consequat. Aliquam suscipit, magna at hendrerit porta, neque risus eleifend orci, ut pulvinar dui nulla convallis nibh. Proin tristique interdum ipsum, quis auctor lectus consectetur non. Sed et rhoncus ante. Cras mattis purus vitae feugiat tempor. Suspendisse elementum finibus sem, ac viverra mi sollicitudin at. Morbi varius vestibulum tortor vitae pharetra. Fusce at dictum quam, vitae sollicitudin risus. Nulla sed libero nec tellus vehicula auctor at vel justo. Sed id lorem semper nisl blandit pretium. Quisque sed felis vitae diam porttitor laoreet et et mi. Etiam non erat posuere, dignissim nisi vel, hendrerit dolor. Etiam ultrices nisl in velit placerat ultrices. Nunc pulvinar augue id orci maximus, ut finibus turpis finibus.

Mauris ullamcorper auctor velit, vitae rhoncus felis bibendum id. Integer ultricies sapien sit amet iaculis viverra. Fusce id sapien non ligula sagittis euismod. Donec ut suscipit nisi. Etiam egestas erat eros, sed hendrerit risus fermentum sit amet. Ut quis rutrum nisi. Mauris mattis sit amet velit ac vestibulum. Proin luctus magna ac dui sagittis, eu consequat magna laoreet. Nunc in urna vitae elit convallis dictum nec ac magna.

Phasellus leo est.

Congue id felis quis

- interdum aliquet eros.
- Nullam arcu mauris
- ultricies at dictum id

Cras at erat tempor odio tempor dictum. Mauris quam nibh, tristique non lobortis id, commodo ac sem. Ut venenatis, dui id eleifend pulvinar, magna nulla gravida tortor, vel tincidunt tellus odio pellentesque risus. Donec accumsan, tellus et consectetur bibendum, felis leo maximus velit, non interdum lacus mauris ac enim. Proin at dictum diam, at sagittis ante. Donec maximus molestie arcu sit amet feugiat. Suspendisse metus urna, faucibus eget maximus ac, eleifend non diam. Ut at placerat nisl, eu tempor purus.
Yeah!
    `,
		name: 'My First Article',
		publishedAt: new Date('2024-06-03'),
		slug: 'good-article',
		status: 'published',
	},
	{
		content: `
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec magna odio, posuere sodales sapien id, semper ultrices nisi. Mauris id diam ut urna maximus consequat. Aliquam suscipit, magna at hendrerit porta, neque risus eleifend orci, ut pulvinar dui nulla convallis nibh. Proin tristique interdum ipsum, quis auctor lectus consectetur non. Sed et rhoncus ante. Cras mattis purus vitae feugiat tempor. Suspendisse elementum finibus sem, ac viverra mi sollicitudin at. Morbi varius vestibulum tortor vitae pharetra. Fusce at dictum quam, vitae sollicitudin risus. Nulla sed libero nec tellus vehicula auctor at vel justo. Sed id lorem semper nisl blandit pretium. Quisque sed felis vitae diam porttitor laoreet et et mi. Etiam non erat posuere, dignissim nisi vel, hendrerit dolor. Etiam ultrices nisl in velit placerat ultrices. Nunc pulvinar augue id orci maximus, ut finibus turpis finibus.

Mauris ullamcorper auctor velit, vitae rhoncus felis bibendum id. Integer ultricies sapien sit amet iaculis viverra. Fusce id sapien non ligula sagittis euismod. Donec ut suscipit nisi. Etiam egestas erat eros, sed hendrerit risus fermentum sit amet. Ut quis rutrum nisi. Mauris mattis sit amet velit ac vestibulum. Proin luctus magna ac dui sagittis, eu consequat magna laoreet. Nunc in urna vitae elit convallis dictum nec ac magna.

Phasellus leo est, congue id felis quis, interdum aliquet eros. Nullam arcu mauris, ultricies at dictum id, pellentesque eu sapien. Cras id dictum nisl. Maecenas finibus condimentum turpis at dapibus. Aliquam velit erat, interdum ut commodo sit amet, suscipit at turpis. Etiam sollicitudin dapibus risus, ut commodo tortor ultricies a. Nam cursus vulputate dignissim. Etiam sed volutpat metus. In hac habitasse platea dictumst. Maecenas semper felis a felis consequat faucibus. Nullam et placerat ligula, a sollicitudin magna. Cras mattis condimentum euismod. Curabitur ut gravida turpis, sit amet pharetra nunc.

Cras at erat tempor odio tempor dictum. Mauris quam nibh, tristique non lobortis id, commodo ac sem. Ut venenatis, dui id eleifend pulvinar, magna nulla gravida tortor, vel tincidunt tellus odio pellentesque risus. Donec accumsan, tellus et consectetur bibendum, felis leo maximus velit, non interdum lacus mauris ac enim. Proin at dictum diam, at sagittis ante. Donec maximus molestie arcu sit amet feugiat. Suspendisse metus urna, faucibus eget maximus ac, eleifend non diam. Ut at placerat nisl, eu tempor purus.

Yeah!
    `,
		name: 'It is not ready yet',
		slug: 'not-yet-ready-article',
		status: 'draft',
	},
]
