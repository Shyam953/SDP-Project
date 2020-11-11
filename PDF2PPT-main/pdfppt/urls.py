from django.urls import path
from pdfppt import views
from django.conf import settings

urlpatterns = [
    path('', views.simple_upload, name='simple_upload'),
    path('edit_lists',views.edit_lists,name='edit_lists'),
    path('about_us',views.about_us,name='about_us'),
]