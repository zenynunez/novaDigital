<?php

$email = "yourname@yourdomain.com";
$subject = "Please intoduce a message subject here";

if ( isset($_POST["contact-name"]) && isset($_POST["contact-email"]) && isset($_POST["contact-message"]) ) {

	$to = $email;
	$subject = $subject;
	$message = $_POST["contact-message"];
	$from = $_POST["contact-email"];
	$headers = "From:" . $from;
	mail( $to, $subject, $message, $headers );	
	echo "Success";

} else {
	
	echo "POST request does not contain necessary data!";
	
}